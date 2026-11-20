const initialState = { cash: 2400, fame: 12, heat: 0, completed: false, mapX: 0, mapY: 4, inCar: false };
const storageKey = 'neon-harbor-save-v1';
const readState = () => {
  try { return { ...initialState, ...JSON.parse(localStorage.getItem(storageKey) || '{}') }; }
  catch { return { ...initialState }; }
};
let state = readState();

const $ = (id) => document.getElementById(id);
function render() {
  $('cash').textContent = `$${state.cash.toLocaleString('en-US')}`;
  $('fame').innerHTML = `${state.fame} <small>/ 100</small>`;
  $('heat').textContent = state.heat === 0 ? '低調' : state.heat < 3 ? '有人注意' : '警方關注';
  $('wanted-stars').textContent = `${'★'.repeat(state.heat)}${'☆'.repeat(5 - state.heat)}`;
  $('cool-down').hidden = state.heat === 0;
  renderMap();
  if (state.completed) {
    $('mission-title').textContent = '失聯的訊號 · 已完成';
    $('mission-description').textContent = '你完成了阿哲的委託。這個選擇已記錄在你的行動檔案中。';
    $('reward').innerHTML = '任務完成 <i>＋狀態已更新</i>';
    $('choices').hidden = true;
    $('result').hidden = false;
  }
}
function renderMap() {
  const player = $('player');
  player.style.left = `${6 + state.mapX * 13}%`;
  player.style.top = `${8 + state.mapY * 18}%`;
  player.textContent = state.inCar ? '🚘' : '●';
  player.classList.toggle('in-car', state.inCar);
  const nearbyCar = Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1;
  $('parked-car').hidden = state.inCar || !nearbyCar;
  $('vehicle-status').textContent = state.inCar ? '🚘 駕駛中 · 車速較快' : nearbyCar ? '🚘 車輛就在旁邊，按 E 上車' : '🚘 回到起點附近可以找到車輛';
  $('vehicle-toggle').textContent = state.inCar ? '下車（E）' : nearbyCar ? '上車（E）' : '附近沒有車';
  $('vehicle-toggle').disabled = !state.inCar && !nearbyCar;
  const atDestination = state.mapX === 6 && state.mapY === 0;
  $('position-label').textContent = atDestination ? '舊電車站' : state.mapX > 3 ? '自由港區' : '港區入口';
  $('walk-hint').textContent = atDestination ? '你到達委託地點了。按 Enter 或點下方按鈕查看委託。' : state.inCar ? '駕駛中移動更快；到達委託點後按 Enter 查看任務。' : '用方向鍵或 WASD 移動，走到右上角的委託點。';
  $('interact').hidden = !atDestination;
}
function move(direction) {
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
  if (!delta) return;
  const speed = state.inCar ? 2 : 1;
  state.mapX = Math.max(0, Math.min(6, state.mapX + delta[0] * speed));
  state.mapY = Math.max(0, Math.min(4, state.mapY + delta[1] * speed));
  localStorage.setItem(storageKey, JSON.stringify(state));
  renderMap();
}
function openMission() { $('missions').scrollIntoView({ behavior: 'smooth' }); }
function toggleVehicle() {
  if (state.inCar) state.inCar = false;
  else if (Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1) state.inCar = true;
  localStorage.setItem(storageKey, JSON.stringify(state));
  renderMap();
}
function coolDown() {
  if (state.heat > 0) state.heat -= 1;
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
}
function choose(choice) {
  if (state.completed) return;
  state.completed = true;
  if (choice === 'talk') {
    state.cash += 650; state.fame += 5;
    $('result').innerHTML = '<strong>和平解決。</strong>店家記得一輛可疑的廂型車，線索讓阿哲找回了零件。你拿到 $650，街頭名聲 +5。';
  } else {
    state.cash += 800; state.fame += 8; state.heat += 1;
    $('result').innerHTML = '<strong>找到貨物了。</strong>你在站內找到遺失零件，也驚動了巡邏人員。你拿到 $800，街頭名聲 +8，警方熱度上升。';
  }
  localStorage.setItem(storageKey, JSON.stringify(state));
  render();
  $('save-note').textContent = '進度已儲存';
}
document.querySelectorAll('.choice').forEach((button) => button.addEventListener('click', () => choose(button.dataset.choice)));
document.querySelectorAll('.move-btn').forEach((button) => button.addEventListener('click', () => move(button.dataset.move)));
$('interact').addEventListener('click', openMission);
$('vehicle-toggle').addEventListener('click', toggleVehicle);
$('cool-down').addEventListener('click', coolDown);
window.addEventListener('keydown', (event) => {
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  if (keyMap[event.key]) { event.preventDefault(); move(keyMap[event.key]); }
  else if ((event.key === 'e' || event.key === 'E') && (state.inCar || Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1)) toggleVehicle();
  else if (event.key === 'Enter' && state.mapX === 6 && state.mapY === 0) openMission();
});
$('reset').addEventListener('click', () => { state = { ...initialState }; localStorage.removeItem(storageKey); $('choices').hidden = false; $('result').hidden = true; $('mission-title').textContent = '失聯的訊號'; $('mission-description').textContent = '修車師傅阿哲的貨車停在舊電車站附近，車上的一袋零件不見了。他想知道發生了什麼，並願意付你一筆跑腿費。'; $('reward').innerHTML = '$650 <i>＋名聲</i>'; $('save-note').textContent = '進度自動儲存'; render(); });
render();

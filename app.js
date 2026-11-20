const initialState = { cash: 2400, fame: 12, heat: 0, completed: false, missionIndex: 0, missionResult: '', mapX: 0, mapY: 4, inCar: false, vehicleUpgrade: false, activityRuns: 0, activityActive: false, collectibles: [] };
const storageKey = 'neon-harbor-save-v1';
const q = (selector) => document.querySelector(selector);
const missions = [
  {
    title: '失聯的訊號', type: '情報蒐集', duration: '約 5 分鐘', place: '港區 · 舊電車站',
    description: '修車師傅阿哲的貨車停在舊電車站附近，車上的一袋零件不見了。他想知道發生了什麼，並願意付你一筆跑腿費。',
    choices: [
      { title: '先問附近店家', detail: '低風險 · 可能找到線索', cash: 650, fame: 5, heat: 0, result: '和平解決。店家記得一輛可疑的廂型車，線索讓阿哲找回了零件。' },
      { title: '夜裡回現場查看', detail: '中風險 · 可能發現更多', cash: 800, fame: 8, heat: 1, result: '找到貨物了。你在站內發現遺失零件，也引起巡邏人員注意。' },
    ],
  },
  {
    title: '末班車之後', type: '街區委託', duration: '約 4 分鐘', place: '港區 · 公車總站',
    description: '夜班花店店員小葵錯過末班公車，還得把一批花送到河岸市集。你可以陪她走安全的主街，或騎車抄近路趕在花況變差前送達。',
    choices: [
      { title: '沿主街慢慢送達', detail: '低風險 · 收穫鄰里信任', cash: 420, fame: 4, heat: 0, result: '你們沿著明亮的主街準時抵達。小葵把你的名字介紹給河岸市集的攤商。' },
      { title: '騎車走河岸捷徑', detail: '較高報酬 · 警方熱度 +1', cash: 700, fame: 6, heat: 1, result: '花束保住了新鮮度，但你在河岸路段被巡邏車記下車牌。' },
    ],
  },
  {
    title: '天橋下的節奏', type: '計時挑戰', duration: '約 3 分鐘', place: '自由港區 · 高架橋下',
    description: '阿哲邀你參加一場合法封路時段的街區計時賽。路線穿過高架橋與倉庫街，選擇穩定跑完或挑戰更快的路線，會帶來不同名聲。',
    choices: [
      { title: '穩定完成賽道', detail: '安全完賽 · 名聲 +5', cash: 500, fame: 5, heat: 0, result: '你穩定跑完全程，車庫老闆稱讚你的判斷，並留下了聯絡方式。' },
      { title: '挑戰極限路線', detail: '高報酬 · 警方熱度 +2', cash: 950, fame: 9, heat: 2, result: '你刷新了當晚紀錄，但高架橋附近的巡邏隊也注意到了這場賽事。' },
    ],
  },
];
function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return { ...initialState, ...saved, collectibles: Array.isArray(saved.collectibles) ? saved.collectibles.filter((id) => Number.isInteger(id) && id >= 0 && id < 3) : [], missionIndex: Math.max(0, Math.min(missions.length - 1, Number(saved.missionIndex) || 0)), heat: Math.max(0, Math.min(5, Number(saved.heat) || 0)) };
  } catch { return { ...initialState }; }
}
let state = readState();
const $ = (id) => document.getElementById(id);
function save() { localStorage.setItem(storageKey, JSON.stringify(state)); $('save-note').textContent = '進度已儲存'; }
function render() {
  renderStats();
  renderMap(); renderMission(); renderActivity(); renderGarage();
}
function renderStats() {
  $('cash').textContent = `$${state.cash.toLocaleString('en-US')}`;
  $('fame').innerHTML = `${state.fame} <small>/ 100</small>`;
  $('heat').textContent = state.heat === 0 ? '低調' : state.heat < 3 ? '有人注意' : '警方關注';
  $('wanted-stars').textContent = `${'★'.repeat(state.heat)}${'☆'.repeat(5 - state.heat)}`;
  $('cool-down').hidden = state.heat === 0;
  $('collectible-count').textContent = `港灣印記 ✦ ${state.collectibles.length} / 3`;
}
function renderGarage() {
  const installed = Boolean(state.vehicleUpgrade);
  $('garage-status').textContent = installed ? '引擎調校已安裝，駕駛時每次可移動 3 格。' : '花費 $900 調整車輛，駕駛時每次可多移動一格。';
  $('upgrade-vehicle').textContent = installed ? '已安裝 ✓' : '安裝調校 · $900';
  $('upgrade-vehicle').disabled = installed || state.cash < 900;
}
function renderActivity() {
  $('activity-count').textContent = `已完成 ${state.activityRuns} 次`;
  $('activity-start').disabled = state.activityActive;
  $('activity-start').textContent = state.activityActive ? '挑選路線中…' : state.activityRuns ? '再玩一次（$100）' : '開始挑戰（$100）';
  $('activity-choices').hidden = !state.activityActive;
}
function renderMission() {
  const mission = missions[state.missionIndex];
  $('mission-count').textContent = `${String(state.missionIndex + 1).padStart(2, '0')} / ${String(missions.length).padStart(2, '0')}`;
  $('mission-type').textContent = mission.type;
  $('mission-duration').textContent = mission.duration;
  $('mission-title').textContent = state.completed ? `${mission.title} · 已完成` : mission.title;
  $('mission-description').textContent = state.completed ? '委託已完成。你的選擇已記錄在行動檔案中。' : mission.description;
  $('reward').innerHTML = state.completed ? '任務完成 <i>＋狀態已更新</i>' : mission.choices.map((choice) => `$${choice.cash}`).join(' / ') + ' <i>＋名聲</i>';
  $('choices').innerHTML = mission.choices.map((choice, index) => `<button class="choice" data-choice="${index}"><span class="choice-key">${String.fromCharCode(65 + index)}</span><span><b>${choice.title}</b><small>${choice.detail}</small></span><span class="choice-arrow">↗</span></button>`).join('');
  $('choices').hidden = state.completed;
  $('result').hidden = !state.completed;
  $('result').textContent = state.completed ? state.missionResult || '委託已完成。' : '';
  $('next-mission').hidden = !state.completed || state.missionIndex >= missions.length - 1;
  if (state.completed && state.missionIndex === missions.length - 1) $('result').textContent += ' 這是目前故事章節的最後一份委託。';
  q('.mission-visual .visual-caption').textContent = mission.place;
  q('.mission-visual .tag').textContent = state.completed ? '已完成' : '新委託';
}
function renderMap() {
  const player = $('player');
  player.style.left = `${6 + state.mapX * 13}%`; player.style.top = `${8 + state.mapY * 18}%`;
  player.textContent = state.inCar ? '🚘' : '●'; player.classList.toggle('in-car', state.inCar);
  const nearbyCar = Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1;
  $('parked-car').hidden = state.inCar || !nearbyCar;
  [0, 1, 2].forEach((id) => { $(`collectible-${id}`).hidden = state.collectibles.includes(id); });
  $('vehicle-status').textContent = state.inCar ? `🚘 駕駛中 · 每次移動 ${state.vehicleUpgrade ? 3 : 2} 格` : nearbyCar ? '🚘 車輛就在旁邊，按 E 上車' : '🚘 回到起點附近可以找到車輛';
  $('vehicle-toggle').textContent = state.inCar ? '下車（E）' : nearbyCar ? '上車（E）' : '附近沒有車';
  $('vehicle-toggle').disabled = !state.inCar && !nearbyCar;
  const atDestination = state.mapX === 6 && state.mapY === 0;
  $('position-label').textContent = atDestination ? '舊電車站' : state.mapX > 3 ? '自由港區' : '港區入口';
  $('walk-hint').textContent = state.lastDiscovery || (atDestination ? '你到達委託地點了。按 Enter 或點下方按鈕查看委託。' : state.inCar ? '駕駛中移動更快；沿路留意發光的港灣印記。' : '用方向鍵或 WASD 移動，沿路留意發光的港灣印記。');
  state.lastDiscovery = '';
  $('interact').hidden = !atDestination;
}
function move(direction) {
  const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
  if (!delta) return;
  const speed = state.inCar ? (state.vehicleUpgrade ? 3 : 2) : 1;
  for (let step = 0; step < speed; step += 1) {
    state.mapX = Math.max(0, Math.min(6, state.mapX + delta[0]));
    state.mapY = Math.max(0, Math.min(4, state.mapY + delta[1]));
    collectAt(state.mapX, state.mapY);
  }
  renderStats(); renderMap(); save();
}
function collectAt(x, y) {
  const spots = [[2, 2], [5, 3], [4, 0]];
  const index = spots.findIndex(([spotX, spotY]) => spotX === x && spotY === y);
  if (index < 0 || state.collectibles.includes(index)) return;
  state.collectibles = [...state.collectibles, index];
  state.cash += 150; state.fame = Math.min(100, state.fame + 2);
  state.lastDiscovery = '找到港灣印記！獲得 $150 與 2 點名聲。';
}
function openMission() { $('missions').scrollIntoView({ behavior: 'smooth' }); }
function toggleVehicle() {
  const nearbyCar = Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1;
  if (state.inCar) state.inCar = false; else if (nearbyCar) state.inCar = true;
  save(); renderMap();
}
function coolDown() { if (state.heat > 0) state.heat -= 1; save(); render(); }
function startActivity() {
  if (state.activityActive) return;
  if (state.cash < 100) { $('activity-status').textContent = '現金不足，至少需要 $100 報名費。'; return; }
  state.cash -= 100; state.activityActive = true;
  $('activity-status').textContent = '路線已準備好，選擇一種方式完成挑戰。';
  save(); render();
}
function finishActivity(route) {
  if (!state.activityActive) return;
  if (route === 'steady') {
    state.cash += 260; state.fame = Math.min(100, state.fame + 2);
    $('activity-status').textContent = '你穩定完成一圈，拿到 $260 獎金與 2 點名聲。';
  } else {
    state.cash += 500; state.fame = Math.min(100, state.fame + 3); state.heat = Math.min(5, state.heat + 1);
    $('activity-status').textContent = '你從捷徑搶下最佳時間，拿到 $500 獎金與 3 點名聲；警方熱度增加 1 級。';
  }
  state.activityRuns += 1; state.activityActive = false; save(); render();
}
function upgradeVehicle() {
  if (state.vehicleUpgrade || state.cash < 900) return;
  state.cash -= 900; state.vehicleUpgrade = true;
  save(); render();
}
function choose(index) {
  if (state.completed) return;
  const choice = missions[state.missionIndex].choices[index];
  if (!choice) return;
  state.completed = true; state.cash += choice.cash; state.fame = Math.min(100, state.fame + choice.fame); state.heat = Math.min(5, state.heat + choice.heat); state.missionResult = choice.result;
  save(); render();
}
function nextMission() {
  if (!state.completed || state.missionIndex >= missions.length - 1) return;
  state.missionIndex += 1; state.completed = false; state.missionResult = '';
  save(); render();
}
document.querySelectorAll('.move-btn').forEach((button) => button.addEventListener('click', () => move(button.dataset.move)));
$('choices').addEventListener('click', (event) => { const button = event.target.closest('.choice'); if (button) choose(Number(button.dataset.choice)); });
$('interact').addEventListener('click', openMission);
$('vehicle-toggle').addEventListener('click', toggleVehicle);
$('cool-down').addEventListener('click', coolDown);
$('next-mission').addEventListener('click', nextMission);
$('activity-start').addEventListener('click', startActivity);
$('activity-choices').addEventListener('click', (event) => { const button = event.target.closest('.activity-choice'); if (button) finishActivity(button.dataset.ride); });
$('upgrade-vehicle').addEventListener('click', upgradeVehicle);
window.addEventListener('keydown', (event) => {
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  if (keyMap[event.key]) { event.preventDefault(); move(keyMap[event.key]); }
  else if ((event.key === 'e' || event.key === 'E') && (state.inCar || Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1)) toggleVehicle();
  else if (event.key === 'Enter' && state.mapX === 6 && state.mapY === 0) openMission();
});
$('reset').addEventListener('click', () => { state = { ...initialState, collectibles: [] }; localStorage.removeItem(storageKey); render(); $('save-note').textContent = '進度自動儲存'; });
render();

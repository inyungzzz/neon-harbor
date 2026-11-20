const initialState = { cash: 2400, fame: 12, heat: 0, completed: false, missionAccepted: false, missionIndex: 0, missionResult: '', mapX: 0, mapY: 4, inCar: false, vehicleUpgrade: false, activityRuns: 0, activityActive: false, collectibles: [], relationships: { zhe: 0, kui: 0 }, gameMinutes: 1300 };
const storageKey = 'neon-harbor-save-v1';
const q = (selector) => document.querySelector(selector);
const missions = [
  {
    title: '失聯的訊號', type: '情報蒐集', duration: '約 5 分鐘', place: '港區 · 舊電車站', destination: [6, 0],
    description: '修車師傅阿哲的貨車停在舊電車站附近，車上的一袋零件不見了。他想知道發生了什麼，並願意付你一筆跑腿費。',
    choices: [
      { title: '先問附近店家', detail: '低風險 · 阿哲信任 +2', cash: 650, fame: 5, heat: 0, relationship: 'zhe', bond: 2, result: '和平解決。店家記得一輛可疑的廂型車，線索讓阿哲找回了零件。' },
      { title: '夜裡回現場查看', detail: '中風險 · 報酬較高', cash: 800, fame: 8, heat: 1, relationship: 'zhe', bond: 0, result: '找到貨物了。你在站內發現遺失零件，也引起巡邏人員注意。' },
    ],
  },
  {
    title: '末班車之後', type: '街區委託', duration: '約 4 分鐘', place: '港區 · 公車總站', destination: [0, 2],
    description: '夜班花店店員小葵錯過末班公車，還得把一批花送到河岸市集。你可以陪她走安全的主街，或騎車抄近路趕在花況變差前送達。',
    choices: [
      { title: '沿主街慢慢送達', detail: '低風險 · 小葵信任 +2', cash: 420, fame: 4, heat: 0, relationship: 'kui', bond: 2, result: '你們沿著明亮的主街準時抵達。小葵把你的名字介紹給河岸市集的攤商。' },
      { title: '騎車走河岸捷徑', detail: '較高報酬 · 小葵信任 +1、熱度 +1', cash: 700, fame: 6, heat: 1, relationship: 'kui', bond: 1, result: '花束保住了新鮮度，但你在河岸路段被巡邏車記下車牌。' },
    ],
  },
  {
    title: '天橋下的節奏', type: '計時挑戰', duration: '約 3 分鐘', place: '自由港區 · 高架橋下', destination: [6, 2],
    description: '阿哲邀你參加一場合法封路時段的街區計時賽。路線穿過高架橋與倉庫街，選擇穩定跑完或挑戰更快的路線，會帶來不同名聲。',
    choices: [
      { title: '穩定完成賽道', detail: '安全完賽 · 阿哲信任 +1', cash: 500, fame: 5, heat: 0, relationship: 'zhe', bond: 1, result: '你穩定跑完全程，車庫老闆稱讚你的判斷，並留下了聯絡方式。' },
      { title: '挑戰極限路線', detail: '高報酬 · 警方熱度 +2', cash: 950, fame: 9, heat: 2, relationship: 'kui', bond: 1, result: '你刷新了當晚紀錄，但高架橋附近的巡邏隊也注意到了這場賽事。' },
    ],
  },
];
function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const relationships = saved.relationships || {};
    return { ...initialState, ...saved, relationships: { zhe: Math.max(0, Math.min(3, Number(relationships.zhe) || 0)), kui: Math.max(0, Math.min(3, Number(relationships.kui) || 0)) }, collectibles: Array.isArray(saved.collectibles) ? saved.collectibles.filter((id) => Number.isInteger(id) && id >= 0 && id < 3) : [], missionIndex: Math.max(0, Math.min(missions.length - 1, Number(saved.missionIndex) || 0)), heat: Math.max(0, Math.min(5, Number(saved.heat) || 0)), gameMinutes: ((Number(saved.gameMinutes ?? initialState.gameMinutes) || 0) % 1440 + 1440) % 1440 };
  } catch { return { ...initialState }; }
}
let state = readState();
const $ = (id) => document.getElementById(id);
function save() { localStorage.setItem(storageKey, JSON.stringify(state)); $('save-note').textContent = '進度已儲存'; }
function render() {
  renderClock();
  renderStats(); renderConnections();
  renderMap(); renderMission(); renderActivity(); renderGarage();
}
function renderClock() {
  const hour = Math.floor(state.gameMinutes / 60);
  const minute = state.gameMinutes % 60;
  const isDay = hour >= 6 && hour < 18;
  $('game-time').textContent = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  $('time-period').textContent = isDay ? '白晝' : '夜間';
  document.body.dataset.period = isDay ? 'day' : 'night';
}
function advanceTime(minutes) { state.gameMinutes = (state.gameMinutes + minutes) % 1440; }
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
  const cost = state.relationships.zhe >= 2 ? 600 : 900;
  $('garage-status').textContent = installed ? '引擎調校已安裝，駕駛時每次可移動 3 格。' : `花費 $${cost} 調整車輛，駕駛時每次可多移動一格。`;
  $('upgrade-vehicle').textContent = installed ? '已安裝 ✓' : `安裝調校 · $${cost}`;
  $('upgrade-vehicle').disabled = installed || state.cash < cost;
}
function renderConnections() {
  for (const name of ['zhe', 'kui']) {
    const trust = state.relationships[name];
    $(`${name}-trust`).textContent = `${trust} / 3`;
    $(`${name}-meter`).style.width = `${Math.round(trust / 3 * 100)}%`;
    $(`${name}-perk`).textContent = trust >= 2 ? (name === 'zhe' ? '已解鎖：引擎調校優惠 $600' : '已解鎖：兜風挑戰免報名費') : `信任達 2 點：${name === 'zhe' ? '引擎調校優惠' : '兜風挑戰免報名費'}`;
  }
}
function renderActivity() {
  const fee = state.relationships.kui >= 2 ? 0 : 100;
  $('activity-count').textContent = `已完成 ${state.activityRuns} 次`;
  $('activity-start').disabled = state.activityActive;
  $('activity-start').textContent = state.activityActive ? '挑選路線中…' : `${state.activityRuns ? '再玩一次' : '開始挑戰'}（${fee ? '$100' : '免費'}）`;
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
  $('choices').hidden = state.completed || !state.missionAccepted;
  $('mission-locked').hidden = state.completed || state.missionAccepted;
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
  const destination = missions[state.missionIndex].destination;
  const atDestination = state.mapX === destination[0] && state.mapY === destination[1];
  const marker = q('.mission-pin');
  marker.style.left = `${6 + destination[0] * 13}%`; marker.style.top = `${8 + destination[1] * 18}%`; marker.style.right = 'auto';
  $('position-label').textContent = atDestination ? missions[state.missionIndex].place.split(' · ').pop() : state.mapX > 3 ? '自由港區' : '港區入口';
  $('walk-hint').textContent = state.lastDiscovery || (atDestination ? state.missionAccepted ? '委託已接取，選擇一種處理方式。' : '你到達委託地點了。按 Enter 接取委託。' : state.inCar ? '駕駛中移動更快；沿路留意發光的港灣印記。' : '用方向鍵或 WASD 移動，沿路留意發光的港灣印記。');
  state.lastDiscovery = '';
  $('interact').hidden = !atDestination || state.completed;
  $('interact').innerHTML = `${state.missionAccepted ? '查看委託' : '接取委託'} <span>Enter</span>`;
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
  advanceTime(speed * 5);
  renderClock();
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
function openMission() {
  const destination = missions[state.missionIndex].destination;
  if (state.mapX !== destination[0] || state.mapY !== destination[1] || state.completed) return;
  if (!state.missionAccepted) { state.missionAccepted = true; save(); renderMission(); renderMap(); }
  $('missions').scrollIntoView({ behavior: 'smooth' });
}
function toggleVehicle() {
  const nearbyCar = Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1;
  if (state.inCar) state.inCar = false; else if (nearbyCar) state.inCar = true;
  save(); renderMap();
}
function coolDown() { if (state.heat > 0) state.heat -= 1; save(); render(); }
function startActivity() {
  if (state.activityActive) return;
  const fee = state.relationships.kui >= 2 ? 0 : 100;
  if (state.cash < fee) { $('activity-status').textContent = '現金不足，至少需要 $100 報名費。'; return; }
  state.cash -= fee; state.activityActive = true;
  $('activity-status').textContent = fee ? '路線已準備好，選擇一種方式完成挑戰。' : '小葵幫你免除報名費，選擇一種方式完成挑戰。';
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
  state.activityRuns += 1; state.activityActive = false; advanceTime(15); save(); render();
}
function upgradeVehicle() {
  const cost = state.relationships.zhe >= 2 ? 600 : 900;
  if (state.vehicleUpgrade || state.cash < cost) return;
  state.cash -= cost; state.vehicleUpgrade = true;
  save(); render();
}
function choose(index) {
  if (state.completed) return;
  const choice = missions[state.missionIndex].choices[index];
  if (!choice) return;
  state.completed = true; state.cash += choice.cash; state.fame = Math.min(100, state.fame + choice.fame); state.heat = Math.min(5, state.heat + choice.heat); state.missionResult = choice.result;
  if (choice.relationship && choice.bond) state.relationships[choice.relationship] = Math.min(3, state.relationships[choice.relationship] + choice.bond);
  advanceTime(60);
  save(); render();
}
function nextMission() {
  if (!state.completed || state.missionIndex >= missions.length - 1) return;
  state.missionIndex += 1; state.completed = false; state.missionAccepted = false; state.missionResult = '';
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
  else if (event.key === 'Enter') openMission();
});
$('reset').addEventListener('click', () => { state = { ...initialState, collectibles: [] }; localStorage.removeItem(storageKey); render(); $('save-note').textContent = '進度自動儲存'; });
render();

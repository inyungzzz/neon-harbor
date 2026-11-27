const initialState = { cash: 2400, fame: 12, heat: 0, completed: false, missionAccepted: false, missionIndex: 0, missionResult: '', actionHistory: [], mapX: 0, mapY: 4, inCar: false, vehicleUpgrade: false, activityRuns: 0, activityActive: false, collectibles: [], relationships: { zhe: 0, kui: 0 }, gameMinutes: 1300 };
const storageKey = 'neon-harbor-save-v1';
const exportFormat = 'neon-harbor-save';
const exportVersion = 1;
const q = (selector) => document.querySelector(selector);
const missions = window.neonHarborMissions;
const { normalizeState } = window.createNeonHarborSaveTools(initialState, missions.length);
function readState() {
  try { return normalizeState(JSON.parse(localStorage.getItem(storageKey) || '{}')); }
  catch { return normalizeState(); }
}
let state = readState();
const $ = (id) => document.getElementById(id);
function save() { localStorage.setItem(storageKey, JSON.stringify(state)); $('save-note').textContent = '進度已儲存'; }
function exportSave() {
  const backup = { format: exportFormat, version: exportVersion, exportedAt: new Date().toISOString(), state };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `neon-harbor-save-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  $('save-note').textContent = '備份已下載';
}
async function importSave(file) {
  try {
    const backup = JSON.parse(await file.text());
    if (!backup || backup.format !== exportFormat || backup.version !== exportVersion || !backup.state || typeof backup.state !== 'object' || Array.isArray(backup.state)) {
      throw new Error('檔案格式或版本不支援。');
    }
    if (!window.confirm('匯入這份備份會取代目前瀏覽器的遊戲進度，確定繼續嗎？')) {
      $('save-note').textContent = '已取消匯入';
      return;
    }
    const importedState = normalizeState(backup.state);
    localStorage.setItem(storageKey, JSON.stringify(importedState));
    state = importedState;
    render();
    $('save-note').textContent = '備份已匯入';
  } catch (error) {
    $('save-note').textContent = `匯入失敗：${error instanceof SyntaxError ? 'JSON 檔案無法解析。' : error.message}`;
  } finally {
    $('import-save-file').value = '';
  }
}
function render() {
  renderClock();
  renderStats(); renderConnections();
  renderMap(); renderMission(); renderActivity(); renderGarage();
  renderHistory();
}
function renderHistory() {
  const list = $('mission-history');
  list.replaceChildren();
  if (!state.actionHistory.length) {
    const empty = document.createElement('li');
    empty.className = 'history-empty';
    empty.textContent = '完成委託或兜風挑戰後，行動紀錄會顯示在這裡。';
    list.append(empty);
    return;
  }
  [...state.actionHistory].reverse().forEach((entry) => {
    const item = document.createElement('li');
    const heading = document.createElement('div');
    heading.className = 'history-heading';
    const title = document.createElement('strong');
    title.textContent = entry.title;
    const time = document.createElement('time');
    time.textContent = `${String(Math.floor(entry.time / 60)).padStart(2, '0')}:${String(entry.time % 60).padStart(2, '0')}`;
    heading.append(title, time);
    const choice = document.createElement('p');
    choice.className = 'history-choice';
    choice.textContent = `${entry.kind === 'activity' ? '活動路線' : '你的選擇'}：${entry.choice}`;
    const result = document.createElement('p');
    result.className = 'history-result';
    result.textContent = entry.result;
    item.append(heading, choice, result);
    list.append(item);
  });
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
  const atSafehouse = state.mapX === 0 && state.mapY === 4;
  $('cool-down').disabled = !atSafehouse;
  $('cool-down').innerHTML = atSafehouse ? '躲避巡查 <span>花 30 分鐘降低 1 級</span>' : '返回港區入口 <span>才能躲避巡查</span>';
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
  if (state.completed && state.missionIndex === missions.length - 1) {
    $('result').textContent += `\n\n章節回響：${getChapterEpilogue()}`;
  }
  const chapterStatus = $('chapter-status');
  if (state.completed && state.missionIndex === missions.length - 1) chapterStatus.textContent = '本章委託已全部完成，你的每個選擇都保存在行動檔案。';
  else if (state.completed) chapterStatus.textContent = '新委託已解鎖。整理好後前往新的地圖標記接案。';
  else if (state.missionIndex > 0) chapterStatus.textContent = '主線委託已解鎖，前往地圖上的新標記接案。';
  else chapterStatus.textContent = '完成第一份委託，解鎖更多城市故事。';
  q('.mission-visual .visual-caption').textContent = mission.place;
  q('.mission-visual .tag').textContent = state.completed ? '已完成' : '新委託';
}
function getChapterEpilogue() {
  if (state.heat >= 3) return '巡邏線仍留意著港區。街坊記得你幫忙的方式，接下來得先想好怎麼低調行動。';
  if (state.relationships.zhe >= 2 && state.relationships.kui >= 2) return '阿哲的車庫與小葵的河岸人脈都向你敞開，這座港口開始把你當自己人。';
  if (state.relationships.zhe >= 2) return '阿哲把車庫當成你的落腳點；熟悉的引擎聲，成了你在港區的後盾。';
  if (state.relationships.kui >= 2) return '小葵把你介紹給河岸攤商；往後走進市集，會有人認得你的面孔。';
  return '市集恢復平靜。這趟奔走替你在自由港區留下第一個名聲。';
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
function coolDown() {
  if (state.heat === 0 || state.mapX !== 0 || state.mapY !== 4) return;
  state.heat -= 1; advanceTime(30); save(); render();
}
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
  state.activityRuns += 1; state.activityActive = false; advanceTime(15);
  state.actionHistory.push({ kind: 'activity', title: '港區兜風挑戰', choice: route === 'steady' ? '穩定路線' : '挑戰捷徑', result: route === 'steady' ? '穩定完成一圈，獲得 $260 獎金與 2 點名聲。' : '從捷徑搶下最佳時間，獲得 $500 獎金與 3 點名聲；警方熱度增加 1 級。', time: state.gameMinutes });
  state.actionHistory = state.actionHistory.slice(-50);
  save(); render();
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
  state.actionHistory.push({ kind: 'mission', title: missions[state.missionIndex].title, choice: choice.title, result: choice.result, time: state.gameMinutes });
  state.actionHistory = state.actionHistory.slice(-50);
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
$('export-save').addEventListener('click', exportSave);
$('import-save-trigger').addEventListener('click', () => $('import-save-file').click());
$('import-save-file').addEventListener('change', (event) => { const file = event.target.files?.[0]; if (file) importSave(file); });
window.addEventListener('keydown', (event) => {
  const activeTag = document.activeElement?.tagName;
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
  const keyMap = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  if (keyMap[event.key]) { event.preventDefault(); move(keyMap[event.key]); }
  else if ((event.key === 'e' || event.key === 'E') && (state.inCar || Math.abs(state.mapX - 1) + Math.abs(state.mapY - 4) <= 1)) toggleVehicle();
  else if (event.key === 'Enter') openMission();
});
$('reset').addEventListener('click', () => {
  if (!window.confirm('確定要重設霓虹港進度嗎？現有任務、收藏與行動紀錄都會清除。')) return;
  state = { ...initialState, collectibles: [], actionHistory: [] };
  localStorage.removeItem(storageKey);
  render();
  $('save-note').textContent = '進度自動儲存';
});
render();

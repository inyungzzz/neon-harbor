const initialState = { cash: 2400, fame: 12, heat: 0, completed: false };
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
  if (state.completed) {
    $('mission-title').textContent = '失聯的訊號 · 已完成';
    $('mission-description').textContent = '你完成了阿哲的委託。這個選擇已記錄在你的行動檔案中。';
    $('reward').innerHTML = '任務完成 <i>＋狀態已更新</i>';
    $('choices').hidden = true;
    $('result').hidden = false;
  }
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
$('reset').addEventListener('click', () => { state = { ...initialState }; localStorage.removeItem(storageKey); $('choices').hidden = false; $('result').hidden = true; $('mission-title').textContent = '失聯的訊號'; $('mission-description').textContent = '修車師傅阿哲的貨車停在舊電車站附近，車上的一袋零件不見了。他想知道發生了什麼，並願意付你一筆跑腿費。'; $('reward').innerHTML = '$650 <i>＋名聲</i>'; $('save-note').textContent = '進度自動儲存'; render(); });
render();

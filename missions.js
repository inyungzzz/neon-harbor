window.neonHarborMissions = [
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
  {
    title: '河岸燈火', type: '街區協力', duration: '約 4 分鐘', place: '河岸市集 · 外環', destination: [3, 1],
    description: '河岸市集的臨時照明突然熄滅，幾個攤位還沒收完。小葵認得這裡的店家，阿哲則有一組備用電源；你得在夜色加深前選一種方式幫忙。',
    choices: [
      { title: '協調攤商輪流照明', detail: '低風險 · 小葵信任 +1', cash: 560, fame: 6, heat: 0, relationship: 'kui', bond: 1, result: '店家們分出燈具照亮外環，收攤的人潮也順利散去。小葵把你介紹給更多河岸熟面孔。' },
      { title: '接上車庫備用電源', detail: '較高報酬 · 阿哲信任 +1、熱度 +1', cash: 880, fame: 8, heat: 1, relationship: 'zhe', bond: 1, result: '備用電源讓整排攤位重新亮起來。臨時拉線驚動巡邏隊，但阿哲記下了你解決麻煩的手腕。' },
    ],
  },
];

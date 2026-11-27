const saveBackupFormat = 'neon-harbor-save';
const saveBackupVersion = 1;

function tryWriteNeonHarborState(getStorage, key, value) {
  try {
    getStorage().setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function tryRemoveNeonHarborState(getStorage, key) {
  try {
    getStorage().removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function createNeonHarborSaveTools(initialState, missionCount) {
  function normalizeState(value) {
    const saved = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const { missionHistory: legacyMissionHistory, ...savedFields } = saved;
    const relationships = saved.relationships && typeof saved.relationships === 'object' ? saved.relationships : {};
    const historySource = Array.isArray(saved.actionHistory) ? saved.actionHistory : legacyMissionHistory;
    const clampInt = (input, fallback, min, max) => {
      const number = Number(input);
      return Number.isFinite(number) ? Math.max(min, Math.min(max, Math.floor(number))) : fallback;
    };
    const actionHistory = Array.isArray(historySource) ? historySource
      .filter((entry) => entry && typeof entry.title === 'string' && typeof entry.choice === 'string' && typeof entry.result === 'string' && Number.isFinite(entry.time) && entry.time >= 0 && entry.time < 1440)
      .map((entry) => ({ kind: entry.kind === 'activity' ? 'activity' : 'mission', title: entry.title.slice(0, 100), choice: entry.choice.slice(0, 160), result: entry.result.slice(0, 1200), time: Math.floor(entry.time) }))
      .slice(-50) : [];
    const collectibles = Array.isArray(saved.collectibles) ? [...new Set(saved.collectibles.filter((id) => Number.isInteger(id) && id >= 0 && id < 3))] : [];
    const gameMinutes = Number(saved.gameMinutes ?? initialState.gameMinutes);
    return {
      ...initialState,
      ...savedFields,
      cash: clampInt(saved.cash, initialState.cash, 0, 1000000000),
      fame: clampInt(saved.fame, initialState.fame, 0, 100),
      heat: clampInt(saved.heat, initialState.heat, 0, 5),
      completed: saved.completed === true,
      missionAccepted: saved.missionAccepted === true,
      missionIndex: clampInt(saved.missionIndex, 0, 0, missionCount - 1),
      missionResult: typeof saved.missionResult === 'string' ? saved.missionResult.slice(0, 1200) : '',
      actionHistory,
      mapX: clampInt(saved.mapX, initialState.mapX, 0, 6),
      mapY: clampInt(saved.mapY, initialState.mapY, 0, 4),
      inCar: saved.inCar === true,
      vehicleUpgrade: saved.vehicleUpgrade === true,
      activityRuns: clampInt(saved.activityRuns, 0, 0, 1000000000),
      activityActive: saved.activityActive === true,
      collectibles,
      relationships: { zhe: clampInt(relationships.zhe, 0, 0, 3), kui: clampInt(relationships.kui, 0, 0, 3) },
      gameMinutes: Number.isFinite(gameMinutes) ? ((Math.floor(gameMinutes) % 1440) + 1440) % 1440 : initialState.gameMinutes,
    };
  }

  function createBackup(value, exportedAt = new Date().toISOString()) {
    return { format: saveBackupFormat, version: saveBackupVersion, exportedAt, state: normalizeState(value) };
  }

  function parseBackup(value) {
    const backup = typeof value === 'string' ? JSON.parse(value) : value;
    if (!backup || backup.format !== saveBackupFormat || backup.version !== saveBackupVersion || !backup.state || typeof backup.state !== 'object' || Array.isArray(backup.state)) {
      throw new Error('檔案格式或版本不支援。');
    }
    return normalizeState(backup.state);
  }

  return { normalizeState, createBackup, parseBackup, tryWriteNeonHarborState, tryRemoveNeonHarborState };
}

if (typeof window !== 'undefined') window.createNeonHarborSaveTools = createNeonHarborSaveTools;
if (typeof module !== 'undefined' && module.exports) module.exports = { createNeonHarborSaveTools, tryWriteNeonHarborState, tryRemoveNeonHarborState };

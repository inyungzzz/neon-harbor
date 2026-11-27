const test = require('node:test');
const assert = require('node:assert/strict');
const { createNeonHarborSaveTools } = require('../save-state.js');

const initialState = {
  cash: 2400, fame: 12, heat: 0, completed: false, missionAccepted: false,
  missionIndex: 0, missionResult: '', actionHistory: [], mapX: 0, mapY: 4,
  inCar: false, vehicleUpgrade: false, activityRuns: 0, activityActive: false,
  collectibles: [], relationships: { zhe: 0, kui: 0 }, gameMinutes: 1300,
};
const { normalizeState, createBackup, parseBackup } = createNeonHarborSaveTools(initialState, 4);

test('fills defaults without sharing mutable arrays between saves', () => {
  const first = normalizeState();
  const second = normalizeState(null);
  assert.equal(first.cash, 2400);
  assert.deepEqual(first.actionHistory, []);
  assert.notStrictEqual(first.actionHistory, second.actionHistory);
  assert.notStrictEqual(first.collectibles, second.collectibles);
});

test('migrates legacy mission history and clamps saved values', () => {
  const state = normalizeState({
    cash: -10, fame: 140, heat: 9, missionIndex: 99, mapX: 20, mapY: -4,
    relationships: { zhe: 8, kui: -1 }, collectibles: [1, 1, 9], gameMinutes: 1500,
    missionHistory: [{ title: '舊任務', choice: 'A', result: '已完成', time: 65 }],
  });
  assert.equal(state.cash, 0);
  assert.equal(state.fame, 100);
  assert.equal(state.heat, 5);
  assert.equal(state.missionIndex, 3);
  assert.equal(state.mapX, 6);
  assert.equal(state.mapY, 0);
  assert.deepEqual(state.relationships, { zhe: 3, kui: 0 });
  assert.deepEqual(state.collectibles, [1]);
  assert.equal(state.gameMinutes, 60);
  assert.deepEqual(state.actionHistory, [{ kind: 'mission', title: '舊任務', choice: 'A', result: '已完成', time: 65 }]);
  assert.equal('missionHistory' in state, false);
});

test('keeps the newest 50 valid mission and activity records', () => {
  const actionHistory = Array.from({ length: 60 }, (_, index) => ({
    kind: index % 2 ? 'mission' : 'activity', title: `行動 ${index}`,
    choice: '路線', result: '完成', time: index,
  }));
  const state = normalizeState({ actionHistory });
  assert.equal(state.actionHistory.length, 50);
  assert.equal(state.actionHistory[0].title, '行動 10');
  assert.equal(state.actionHistory.at(-1).title, '行動 59');
});

test('drops malformed history entries and falls back from invalid values', () => {
  const state = normalizeState({
    cash: 'not a number', relationships: null, gameMinutes: 'NaN',
    actionHistory: [{ title: '壞資料', choice: 'A', result: 'x', time: 1440 }, null],
  });
  assert.equal(state.cash, 2400);
  assert.equal(state.gameMinutes, 1300);
  assert.deepEqual(state.relationships, { zhe: 0, kui: 0 });
  assert.deepEqual(state.actionHistory, []);
});

test('exports and imports a versioned backup without losing normalized progress', () => {
  const source = normalizeState({
    cash: 3800, missionIndex: 2, vehicleUpgrade: true,
    actionHistory: [{ kind: 'activity', title: '兜風', choice: '穩定路線', result: '完成', time: 515 }],
  });
  const backup = createBackup(source, '2026-11-27T00:00:00.000Z');
  assert.equal(backup.format, 'neon-harbor-save');
  assert.equal(backup.version, 1);
  assert.equal(backup.exportedAt, '2026-11-27T00:00:00.000Z');
  assert.deepEqual(parseBackup(JSON.stringify(backup)), source);
});

test('rejects invalid JSON, unknown formats, and unsupported backup versions', () => {
  assert.throws(() => parseBackup('{'), SyntaxError);
  assert.throws(() => parseBackup({ format: 'other', version: 1, state: {} }), /格式或版本/);
  assert.throws(() => parseBackup({ format: 'neon-harbor-save', version: 2, state: {} }), /格式或版本/);
  assert.throws(() => parseBackup({ format: 'neon-harbor-save', version: 1, state: [] }), /格式或版本/);
});

const test = require('node:test');
const assert = require('node:assert/strict');
const { traceNeonHarborGridMove, getNeonHarborMoveSteps } = require('../movement.js');

test('keeps vehicle movement precise while preserving a modest upgrade benefit', () => {
  assert.equal(getNeonHarborMoveSteps(false, false), 1);
  assert.equal(getNeonHarborMoveSteps(true, false), 1);
  assert.equal(getNeonHarborMoveSteps(true, true), 2);
});

test('traces each traversed cell for walking and vehicle movement', () => {
  assert.deepEqual(traceNeonHarborGridMove(1, 4, 'right', 1), [{ x: 2, y: 4 }]);
  assert.deepEqual(traceNeonHarborGridMove(1, 4, 'up', 3), [{ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 1 }]);
});

test('stops at map edges and returns only cells actually reached', () => {
  assert.deepEqual(traceNeonHarborGridMove(5, 2, 'right', 3), [{ x: 6, y: 2 }]);
  assert.deepEqual(traceNeonHarborGridMove(6, 2, 'right', 3), []);
  assert.deepEqual(traceNeonHarborGridMove(0, 0, 'up', 2), []);
});

test('returns no path for invalid directions or step counts', () => {
  assert.deepEqual(traceNeonHarborGridMove(2, 2, 'teleport', 1), []);
  assert.deepEqual(traceNeonHarborGridMove(2, 2, 'left', 0), []);
  assert.deepEqual(traceNeonHarborGridMove(2, 2, 'left', 1.5), []);
});

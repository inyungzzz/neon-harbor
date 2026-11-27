const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldOpenMissionFromEnter, getMissionChoiceFromKey } = require('../keyboard.js');

test('allows the map Enter shortcut when focus is outside native controls', () => {
  assert.equal(shouldOpenMissionFromEnter('BODY'), true);
  assert.equal(shouldOpenMissionFromEnter('DIV'), true);
  assert.equal(shouldOpenMissionFromEnter(undefined), true);
});

test('maps A and B to visible mission choices when focus is outside controls', () => {
  assert.equal(getMissionChoiceFromKey('a', 'BODY', false, true), 0);
  assert.equal(getMissionChoiceFromKey('B', 'DIV', false, true), 1);
  assert.equal(getMissionChoiceFromKey('b', undefined, false, true), 1);
});

test('does not route mission letters from controls, editable areas, or hidden choices', () => {
  for (const tagName of ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA']) {
    assert.equal(getMissionChoiceFromKey('a', tagName, false, true), null);
  }
  assert.equal(getMissionChoiceFromKey('a', 'DIV', true, true), null);
  assert.equal(getMissionChoiceFromKey('a', 'BODY', false, false), null);
  assert.equal(getMissionChoiceFromKey('x', 'BODY', false, true), null);
});

test('leaves Enter activation to native interactive elements', () => {
  for (const tagName of ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA']) {
    assert.equal(shouldOpenMissionFromEnter(tagName), false, `${tagName} should keep native Enter behavior`);
  }
  assert.equal(shouldOpenMissionFromEnter('DIV', true), false);
});

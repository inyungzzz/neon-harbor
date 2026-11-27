const test = require('node:test');
const assert = require('node:assert/strict');
const { shouldOpenMissionFromEnter } = require('../keyboard.js');

test('allows the map Enter shortcut when focus is outside native controls', () => {
  assert.equal(shouldOpenMissionFromEnter('BODY'), true);
  assert.equal(shouldOpenMissionFromEnter('DIV'), true);
  assert.equal(shouldOpenMissionFromEnter(undefined), true);
});

test('leaves Enter activation to native interactive elements', () => {
  for (const tagName of ['A', 'BUTTON', 'INPUT', 'SELECT', 'SUMMARY', 'TEXTAREA']) {
    assert.equal(shouldOpenMissionFromEnter(tagName), false, `${tagName} should keep native Enter behavior`);
  }
  assert.equal(shouldOpenMissionFromEnter('DIV', true), false);
});

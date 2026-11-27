const test = require('node:test');
const assert = require('node:assert/strict');
const { getNeonHarborActivityFee } = require('../activity.js');

test('charges the standard activity fee before Kui trust unlocks support', () => {
  assert.equal(getNeonHarborActivityFee(0), 100);
  assert.equal(getNeonHarborActivityFee(1), 100);
});

test('waives the activity fee at the trust threshold', () => {
  assert.equal(getNeonHarborActivityFee(2), 0);
  assert.equal(getNeonHarborActivityFee(3), 0);
});

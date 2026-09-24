const { test } = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('./sarif-gate.cjs');
test('high severity SARIF blocks and clean scan passes', () => {
  const run = { tool: { driver: { rules: [{ id: 'fixture', properties: { 'security-severity': '8.1' } }] } }, results: [{ ruleId: 'fixture' }] };
  assert.equal(evaluate({ runs: [run] }), 1);
  assert.equal(evaluate({ runs: [{ ...run, results: [] }] }), 0);
});
test('invalid/missing scan is not success', () => {
  assert.throws(() => evaluate({}));
  assert.throws(() => evaluate({ runs: [{ invocations: [{ executionSuccessful: false }] }] }));
});

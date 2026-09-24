const fs = require('node:fs');
const path = require('node:path');
function evaluate(report) {
  if (!Array.isArray(report.runs) || !report.runs.length) throw new Error('Invalid SARIF');
  let failures = 0;
  for (const run of report.runs) {
    if (run.invocations?.some(i => i.executionSuccessful === false)) throw new Error('Scanner failed');
    const rules = new Map((run.tool?.driver?.rules || []).map(r => [r.id, r]));
    for (const result of run.results || []) {
      const rule = rules.get(result.ruleId);
      const severity = Number(rule?.properties?.['security-severity'] || 0);
      if (severity >= 7 || result.level === 'error') failures++;
    }
  }
  return failures;
}
module.exports = { evaluate };
if (require.main === module) {
  const directory = process.argv[2];
  const files = fs.readdirSync(directory).filter(f => f.endsWith('.sarif'));
  if (!files.length) throw new Error('No SARIF output; gate fails closed');
  let count = 0;
  for (const file of files) count += evaluate(JSON.parse(fs.readFileSync(path.join(directory, file), 'utf8')));
  console.log(`SAST blocking findings: ${count}`);
  if (count) process.exitCode = 1;
}

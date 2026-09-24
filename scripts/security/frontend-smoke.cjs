const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('../../frontend/node_modules/playwright');
const root = path.resolve(__dirname, '../../frontend/dist/frontend/browser');
const nginx = fs.readFileSync(path.resolve(__dirname, '../../frontend/nginx.coolify.conf'), 'utf8');
const csp = nginx.match(/Content-Security-Policy "([^"]+)"/)[1];
const types = { '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.html': 'text/html', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer((req, res) => {
  res.setHeader('Content-Security-Policy', csp);
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    if (req.url.includes('/auth/refresh')) { res.statusCode = 401; res.end('{}'); return; }
    res.end(JSON.stringify({ success: true, data: {} })); return;
  }
  const candidate = path.resolve(root, '.' + req.url.split('?')[0]);
  if (!candidate.startsWith(root + '/') && candidate !== root) { res.statusCode = 403; res.end(); return; }
  const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : path.join(root, 'index.html');
  res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage();
    const scriptViolations = [];
    await page.exposeFunction('recordViolation', event => { if (event.directive.startsWith('script-src')) scriptViolations.push(event); });
    await page.addInitScript(() => document.addEventListener('securitypolicyviolation', event => window.recordViolation({ directive: event.effectiveDirective, blocked: event.blockedURI })));
    await page.goto(`http://127.0.0.1:${server.address().port}/auth/login`);
    await page.locator('input[type="password"]').waitFor();
    assert.equal(await page.locator('input[type="password"]').count(), 1);
    assert.deepEqual(scriptViolations, []);
    console.log('FRONTEND_CSP_LOGIN_PASS');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => server.close());

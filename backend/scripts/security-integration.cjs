const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
if (!process.env.DATABASE_URL?.includes('therapist_security_test')) throw new Error('Dedicated security test database required');
const { prisma } = require('../dist/config/database');
const { generateTokenPair, assertActiveSession, verifyAccessToken, rotateRefreshToken } = require('../dist/utils/jwt.util');
const { hashPassword, generateResetToken } = require('../dist/utils/password.util');
const { authService } = require('../dist/modules/auth/auth.service');
const app = require('../dist/app').default;
const { env } = require('../dist/config/env');
let server;
let assertions = 0;
async function main() {
  const suffix = randomUUID();
  const a = await prisma.tenant.create({ data: { name: 'Security A', slug: `security-a-${suffix}` } });
  const b = await prisma.tenant.create({ data: { name: 'Security B', slug: `security-b-${suffix}` } });
  const password = 'TestOnly-Security-Password42!';
  const passwordHash = await hashPassword(password);
  const owner = await prisma.user.create({ data: { email: `owner-${suffix}@example.invalid`, fullName: 'Synthetic Owner', passwordHash, role: 'ADMIN', tenantMemberships: { create: { tenantId: a.id, role: 'OWNER' } } } });
  const other = await prisma.user.create({ data: { email: `other-${suffix}@example.invalid`, fullName: 'Synthetic Other', passwordHash, tenantMemberships: { create: { tenantId: b.id, role: 'OWNER' } } } });
  const shared = await prisma.user.create({ data: { email: `shared-${suffix}@example.invalid`, fullName: 'Synthetic Shared', passwordHash, role: 'ADMIN', tenantMemberships: { create: [{ tenantId: a.id, role: 'CLIENT' }, { tenantId: b.id, role: 'ADMIN' }] } } });
  const product = await prisma.product.create({ data: { tenantId: b.id, name: 'B Private', slug: 'private-b', productType: 'SESSION', price: 10, galleryUrls: [] } });
  const order = await prisma.order.create({ data: { tenantId: b.id, clientId: other.id, orderNumber: suffix, subtotal: 10, total: 10 } });
  const item = await prisma.orderItem.create({ data: { orderId: order.id, productId: product.id, productName: product.name, productType: 'SESSION', unitPrice: 10, totalPrice: 10, clientQuestions: [] } });
  const reading = await prisma.reading.create({ data: { tenantId: b.id, clientId: other.id, orderItemId: item.id, title: 'B private delivery' } });
  const appointment = await prisma.appointment.create({ data: { tenantId: b.id, clientId: other.id, scheduledDate: new Date(), startTime: '10:00', endTime: '11:00', durationMinutes: 60 } });
  const privacy = await prisma.privacyRequest.create({ data: { tenantId: b.id, requesterUserId: other.id, type: 'ACCESS', details: 'B private request' } });
  const incident = await prisma.securityIncident.create({ data: { tenantId: b.id, title: 'B private incident', summary: 'Synthetic only', severity: 'LOW', detectedAt: new Date(), controllerAwareAt: new Date(), affectedDataCategories: [] } });
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function call(path, status, options = {}) {
    const response = await fetch(base + path, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'X-Tenant-Slug': a.slug, 'X-Requested-With': 'XMLHttpRequest', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    assert.equal(response.status, status, `${options.method || 'GET'} ${path}: expected ${status}, received ${response.status}: ${text.slice(0, 250)}`);
    assertions++;
    return { response, body: text ? JSON.parse(text) : null };
  }
  await call('/api/settings/public', 200);
  await call('/api/privacy/export', 401);
  await call('/api/auth/login', 403, { method: 'POST', headers: { Origin: 'https://attacker.invalid' }, body: { email: owner.email, password } });
  const login = await call('/api/auth/login', 200, { method: 'POST', body: { email: owner.email, password } });
  assert.equal(login.body.data.refreshToken, undefined);
  const setCookie = login.response.headers.get('set-cookie');
  assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /SameSite=Strict/i);
  const cookie = setCookie.split(';')[0];
  const token = login.body.data.accessToken;
  const headers = { Authorization: `Bearer ${token}` };
  await call('/api/privacy/export', 200, { headers });
  await call('/api/privacy/export', 403, { headers: { ...headers, 'X-Tenant-Slug': b.slug } });
  // A global ADMIN does not bypass memberships, and foreign IDs stay inaccessible.
  for (const path of [`/api/orders/${order.id}`, `/api/admin/deliveries/${reading.id}`, `/api/admin/appointments/${appointment.id}`, `/api/admin/privacy/requests/${privacy.id}`]) {
    await call(path, 404, { headers });
  }
  await call(`/api/admin/privacy/requests/${privacy.id}`, 404, { method: 'PATCH', headers, body: { status: 'IN_REVIEW' } });
  await call(`/api/admin/privacy/incidents/${incident.id}`, 404, { method: 'PATCH', headers, body: { status: 'INVESTIGATING' } });
  await call(`/api/admin/appointments/${appointment.id}/status`, 404, { method: 'PATCH', headers, body: { status: 'CONFIRMED' } });
  await call(`/api/admin/deliveries/${reading.id}/status`, 404, { method: 'PATCH', headers, body: { status: 'IN_PROGRESS' } });
  await call(`/api/products/${product.id}`, 404, { headers });
  await call(`/api/orders/${order.id}`, 404, { method: 'PATCH', headers, body: { status: 'PROCESSING' } });
  const exported = (await call('/api/privacy/export', 200, { headers })).body;
  assert.ok(!JSON.stringify(exported).includes('B private'));
  assert.ok(!/passwordHash|refreshHash|authVersion/.test(JSON.stringify(exported)));
  const sharedTokens = await generateTokenPair(shared);
  await call('/api/admin/privacy/requests', 403, { headers: { Authorization: `Bearer ${sharedTokens.accessToken}` } });
  await call('/api/admin/privacy/requests', 200, { headers: { Authorization: `Bearer ${sharedTokens.accessToken}`, 'X-Tenant-Slug': b.slug } });
  // Unknown host must not resolve by arbitrary first DNS label or explicit tenant header.
  const hostileHostStatus = await new Promise((resolve, reject) => {
    require('node:http').get(base + '/api/tenant/current', { headers: { Host: `${a.slug}.attacker.invalid`, 'X-Tenant-Slug': a.slug } }, res => {
      res.resume(); res.on('end', () => resolve(res.statusCode));
    }).on('error', reject);
  });
  assert.equal(hostileHostStatus, 404); assertions++;
  const refresh = await call('/api/auth/refresh', 200, { method: 'POST', headers: { Cookie: cookie }, body: {} });
  await call('/api/auth/refresh', 401, { method: 'POST', headers: { Cookie: cookie }, body: {} });
  await call('/api/auth/logout', 200, { method: 'POST', headers: { Authorization: `Bearer ${refresh.body.data.accessToken}` }, body: {} });
  await call('/api/privacy/export', 401, { headers });
  const session = await generateTokenPair(owner);
  const races = await Promise.allSettled([rotateRefreshToken(session.refreshToken, a.id), rotateRefreshToken(session.refreshToken, a.id)]);
  assert.equal(races.filter(r => r.status === 'fulfilled').length, 1);
  await authService.changePassword(owner.id, { currentPassword: password, newPassword: 'NewPassword42!', confirmPassword: 'NewPassword42!' });
  await assert.rejects(() => assertActiveSession(verifyAccessToken(session.accessToken)));
  await assert.rejects(() => rotateRefreshToken(session.refreshToken, a.id));
  const updatedOwner = await prisma.user.findUnique({ where: { id: owner.id } });
  const resetSession = await generateTokenPair(updatedOwner);
  const reset = generateResetToken();
  await prisma.user.update({ where: { id: owner.id }, data: { resetToken: reset.hashedToken, resetTokenExpiry: reset.expiry } });
  await authService.resetPassword({ token: reset.token, password, confirmPassword: password });
  await assert.rejects(() => assertActiveSession(verifyAccessToken(resetSession.accessToken)));
  await assert.rejects(() => authService.resetPassword({ token: reset.token, password, confirmPassword: password }));
  await prisma.tenantMembership.update({ where: { tenantId_userId: { tenantId: b.id, userId: shared.id } }, data: { isActive: false } });
  await call('/api/admin/privacy/requests', 403, { headers: { Authorization: `Bearer ${sharedTokens.accessToken}`, 'X-Tenant-Slug': b.slug } });
  console.log(`SECURITY_INTEGRATION_PASS: ${assertions} HTTP assertions plus replay, concurrency and revocation checks`);
}
main().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  if (server) await new Promise(resolve => server.close(resolve));
  await prisma.$disconnect();
});

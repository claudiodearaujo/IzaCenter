import { auditService } from './audit.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { env } from '../../config/env';

describe('AuditService', () => {
  const originalSalt = env.AUDIT_IP_HASH_SALT;

  afterEach(() => {
    env.AUDIT_IP_HASH_SALT = originalSalt;
    jest.clearAllMocks();
  });

  it('hashes IP before persistence and never stores the raw IP field', async () => {
    env.AUDIT_IP_HASH_SALT = 'unit-test-audit-salt';
    prismaMock.auditEvent.create.mockResolvedValue({ id: 'audit-1' } as any);

    await auditService.record({
      tenantId: 'tenant-1',
      actorUserId: 'user-1',
      action: 'privacy.export',
      method: 'GET',
      path: '/privacy/export',
      statusCode: 200,
      outcome: 'SUCCESS',
      requestId: 'request-1',
      ip: '203.0.113.10',
    });

    const call = prismaMock.auditEvent.create.mock.calls[0][0] as any;
    expect(call.data.ipHash).toBeTruthy();
    expect(call.data.ipHash).not.toContain('203.0.113.10');
    expect(call.data.ip).toBeUndefined();
    expect(call.data.actorUserId).toBe('user-1');
  });

  it('stores no IP fingerprint when no audit salt is configured', async () => {
    env.AUDIT_IP_HASH_SALT = '';
    prismaMock.auditEvent.create.mockResolvedValue({ id: 'audit-2' } as any);

    await auditService.record({
      action: 'auth.login',
      method: 'POST',
      path: '/auth/login',
      statusCode: 401,
      outcome: 'FAILURE',
      requestId: 'request-2',
      ip: '198.51.100.9',
    });

    const call = prismaMock.auditEvent.create.mock.calls[0][0] as any;
    expect(call.data.ipHash).toBeNull();
    expect(call.data.ip).toBeUndefined();
  });
});

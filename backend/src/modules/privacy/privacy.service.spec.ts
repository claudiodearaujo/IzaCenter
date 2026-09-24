import { PrivacyService } from './privacy.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { auditService } from './audit.service';

describe('PrivacyService', () => {
  let service: PrivacyService;

  beforeEach(() => {
    service = new PrivacyService();
    jest.clearAllMocks();
  });

  it('exports only the authenticated user data inside the current tenant', async () => {
    prismaMock.tenantMembership.findUnique.mockResolvedValue({
      role: 'CLIENT',
      isActive: true,
      createdAt: new Date('2026-01-01'),
    } as any);
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'client@example.com',
      fullName: 'Cliente',
      phone: null,
      birthDate: null,
      avatarUrl: null,
      preferredLanguage: 'pt-BR',
      notificationEmail: true,
      notificationWhatsapp: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
    } as any);
    prismaMock.order.findMany.mockResolvedValue([]);
    prismaMock.reading.findMany.mockResolvedValue([]);
    prismaMock.appointment.findMany.mockResolvedValue([]);
    prismaMock.testimonial.findMany.mockResolvedValue([]);
    prismaMock.privacyRequest.findMany.mockResolvedValue([]);

    const result = await service.exportUserData('user-1', 'tenant-1');

    expect(result.scope).toEqual({ tenantId: 'tenant-1' });
    expect(result.profile).not.toHaveProperty('passwordHash');
    expect(result.profile).not.toHaveProperty('resetToken');

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', clientId: 'user-1' },
      })
    );
    expect(prismaMock.reading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', clientId: 'user-1' },
      })
    );
    expect(prismaMock.appointment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 'tenant-1', clientId: 'user-1' },
      })
    );

    const userSelect = prismaMock.user.findUnique.mock.calls[0][0]?.select as any;
    expect(userSelect.passwordHash).toBeUndefined();
    expect(userSelect.resetToken).toBeUndefined();
    expect(userSelect.stripeCustomerId).toBeUndefined();
  });

  it('rejects export when the user has no active membership in the tenant', async () => {
    prismaMock.tenantMembership.findUnique.mockResolvedValue(null);

    await expect(
      service.exportUserData('user-1', 'tenant-2')
    ).rejects.toThrow('Usuário');
  });

  it('creates privacy requests scoped to tenant and requester', async () => {
    prismaMock.privacyRequest.create.mockResolvedValue({
      id: 'privacy-1',
      tenantId: 'tenant-1',
      requesterUserId: 'user-1',
      type: 'ACCESS',
      status: 'PENDING',
    } as any);

    await service.createRequest('tenant-1', 'user-1', {
      type: 'ACCESS',
      details: 'Quero uma cópia dos meus dados',
    });

    expect(prismaMock.privacyRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          tenantId: 'tenant-1',
          requesterUserId: 'user-1',
          type: 'ACCESS',
          details: 'Quero uma cópia dos meus dados',
        },
      })
    );
  });

  it('lists admin privacy requests only from the current tenant', async () => {
    prismaMock.privacyRequest.findMany.mockResolvedValue([]);
    prismaMock.privacyRequest.count.mockResolvedValue(0);

    await service.listRequests('tenant-1', {
      page: 1,
      limit: 20,
      status: 'PENDING',
    });

    expect(prismaMock.privacyRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tenantId: 'tenant-1',
          status: 'PENDING',
        },
      })
    );
  });

  it('updates a request and records a minimized audit event', async () => {
    prismaMock.privacyRequest.findFirst.mockResolvedValue({
      id: 'privacy-1',
      status: 'PENDING',
    } as any);
    prismaMock.privacyRequest.update.mockResolvedValue({
      id: 'privacy-1',
      status: 'IN_REVIEW',
    } as any);
    const auditSpy = jest.spyOn(auditService, 'record').mockResolvedValue();

    await service.updateRequest(
      'tenant-1',
      'privacy-1',
      'admin-1',
      { status: 'IN_REVIEW', responseMessage: 'Em análise' },
      'request-1'
    );

    expect(auditSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: 'tenant-1',
        actorUserId: 'admin-1',
        resourceId: 'privacy-1',
        requestId: 'request-1',
        metadata: {
          previousStatus: 'PENDING',
          newStatus: 'IN_REVIEW',
        },
      })
    );
  });

  it('reports retention eligibility without enabling destructive cleanup', async () => {
    prismaMock.dataRetentionPolicy.upsert.mockResolvedValue({
      id: 'policy-1',
      tenantId: 'tenant-1',
      auditRetentionDays: 730,
      privacyRequestRetentionDays: 1825,
      operationalLogRetentionDays: 90,
    } as any);
    prismaMock.auditEvent.count.mockResolvedValue(4);
    prismaMock.privacyRequest.count.mockResolvedValue(2);

    const result = await service.retentionReport('tenant-1');

    expect(result.eligible).toEqual({
      auditEvents: 4,
      closedPrivacyRequests: 2,
    });
    expect(result.destructiveCleanupEnabled).toBe(false);
  });
});

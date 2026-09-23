import { OnboardingService } from './onboarding.service';
import { prismaMock } from '../../test/mocks/prisma.mock';

jest.mock('../../utils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  }),
}));

describe('OnboardingService', () => {
  let service: OnboardingService;

  const data = {
    email: 'owner@example.com',
    password: 'Password123!',
    fullName: 'Ana Profissional',
    phone: '11999999999',
    tenantName: 'Espaço Ana',
    tenantSlug: 'espaco-ana',
    professionalTitle: 'Terapeuta integrativa',
    serviceMode: 'HYBRID' as const,
    contactEmail: 'contato@example.com',
    primaryColor: '#112233',
    secondaryColor: '#445566',
    accentColor: '#778899',
  };

  beforeEach(() => {
    service = new OnboardingService();
    jest.clearAllMocks();
    (prismaMock.$transaction as jest.Mock).mockImplementation(
      async (callback: any) => callback(prismaMock)
    );
  });

  it('rejects reserved workspace slugs', async () => {
    await expect(
      service.onboardProfessional({ ...data, tenantSlug: 'admin' })
    ).rejects.toThrow('reservado');
  });

  it('creates tenant, owner membership and initial settings atomically', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue(null);
    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.tenant.create.mockResolvedValue({
      id: 'tenant-1',
      name: data.tenantName,
      slug: data.tenantSlug,
      status: 'ACTIVE',
      planKey: 'starter',
      customDomain: null,
      onboardingCompletedAt: new Date(),
    } as any);
    prismaMock.user.create.mockResolvedValue({
      id: 'user-1',
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      role: 'CLIENT',
      avatarUrl: null,
      createdAt: new Date(),
    } as any);
    prismaMock.tenantMembership.create.mockResolvedValue({
      id: 'membership-1',
      role: 'OWNER',
      isActive: true,
    } as any);
    prismaMock.saasSubscription.create.mockResolvedValue({
      id: 'subscription-1',
      tenantId: 'tenant-1',
      planKey: 'starter',
      status: 'FREE',
    } as any);
    prismaMock.siteSetting.createMany.mockResolvedValue({ count: 7 });

    const result = await service.onboardProfessional(data);

    expect(result.tenant.slug).toBe('espaco-ana');
    expect(result.user.role).toBe('CLIENT');
    expect(result.membership.role).toBe('OWNER');
    expect(result.accessToken).toBe('access-token');

    expect(prismaMock.tenantMembership.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          userId: 'user-1',
          role: 'OWNER',
        }),
      })
    );

    expect(prismaMock.saasSubscription.create).toHaveBeenCalledWith({
      data: {
        tenantId: 'tenant-1',
        planKey: 'starter',
        status: 'FREE',
        provider: 'stripe',
      },
    });

    expect(prismaMock.siteSetting.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ tenantId: 'tenant-1', key: 'general' }),
        expect.objectContaining({ tenantId: 'tenant-1', key: 'branding' }),
      ]),
    });
  });

  it('rejects duplicate workspace slugs', async () => {
    prismaMock.tenant.findUnique.mockResolvedValue({ id: 'existing' } as any);
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.onboardProfessional(data)).rejects.toThrow(
      'já está em uso'
    );
  });
});

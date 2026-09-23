import { TenantService } from './tenant.service';
import { prismaMock } from '../../test/mocks/prisma.mock';
import { DEFAULT_TENANT_ID } from './tenant.constants';

describe('TenantService', () => {
  let service: TenantService;

  beforeEach(() => {
    service = new TenantService();
    jest.clearAllMocks();
  });

  it('should resolve an explicit active tenant slug', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue({
      id: 'tenant-2',
      name: 'Tenant Dois',
      slug: 'tenant-dois',
      status: 'ACTIVE',
      planKey: 'starter',
      customDomain: null,
    } as any);

    const tenant = await service.resolve('tenant-dois', 'localhost');

    expect(tenant?.id).toBe('tenant-2');
    expect(prismaMock.tenant.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'tenant-dois', status: 'ACTIVE' },
      })
    );
  });

  it('should not silently fall back when an explicit slug is missing', async () => {
    prismaMock.tenant.findFirst.mockResolvedValue(null);

    const tenant = await service.resolve('missing', 'localhost');

    expect(tenant).toBeNull();
    expect(prismaMock.tenant.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should resolve a custom domain before the default tenant', async () => {
    prismaMock.tenant.findFirst.mockResolvedValueOnce({
      id: 'tenant-domain',
      name: 'Tenant Domain',
      slug: 'domain',
      status: 'ACTIVE',
      planKey: 'pro',
      customDomain: 'terapia.local',
    } as any);

    const tenant = await service.resolve(undefined, 'terapia.local');

    expect(tenant?.id).toBe('tenant-domain');
    expect(prismaMock.tenant.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should fall back to the deterministic default tenant', async () => {
    prismaMock.tenant.findFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        id: DEFAULT_TENANT_ID,
        name: 'Default Tenant',
        slug: 'default',
        status: 'ACTIVE',
        planKey: 'starter',
        customDomain: null,
      } as any);

    const tenant = await service.resolve(undefined, 'example.com');

    expect(tenant?.id).toBe(DEFAULT_TENANT_ID);
  });

  it('should read membership by tenant and user composite key', async () => {
    prismaMock.tenantMembership.findUnique.mockResolvedValue({
      id: 'membership-1',
      role: 'OWNER',
      isActive: true,
    } as any);

    const membership = await service.getMembership('tenant-1', 'user-1');

    expect(membership?.role).toBe('OWNER');
    expect(prismaMock.tenantMembership.findUnique).toHaveBeenCalledWith({
      where: {
        tenantId_userId: {
          tenantId: 'tenant-1',
          userId: 'user-1',
        },
      },
      select: {
        id: true,
        role: true,
        isActive: true,
      },
    });
  });
});

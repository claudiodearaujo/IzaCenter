jest.mock('./tenant.service', () => ({
  tenantService: {
    resolve: jest.fn(),
    getMembership: jest.fn(),
    isAllowedRole: jest.fn(),
  },
}));

import { NextFunction, Request, Response } from 'express';
import { requireTenantMembership, resolveTenant } from '../../middlewares/tenant.middleware';
import { tenantService } from './tenant.service';

describe('tenant middleware', () => {
  const resolve = tenantService.resolve as jest.Mock;
  const getMembership = tenantService.getMembership as jest.Mock;
  const isAllowedRole = tenantService.isAllowedRole as jest.Mock;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      headers: {},
      hostname: 'localhost',
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  it('should attach the tenant resolved from X-Tenant-Slug', async () => {
    req.headers = { 'x-tenant-slug': 'tenant-dois' };
    resolve.mockResolvedValue({
      id: 'tenant-2',
      name: 'Tenant Dois',
      slug: 'tenant-dois',
      status: 'ACTIVE',
      planKey: 'starter',
      customDomain: null,
    });

    await resolveTenant(req as Request, res as Response, next);

    expect(resolve).toHaveBeenCalledWith('tenant-dois', 'localhost');
    expect(req.tenant?.id).toBe('tenant-2');
    expect(next).toHaveBeenCalledWith();
  });

  it('should return 404 for an explicit unknown tenant', async () => {
    req.headers = { 'x-tenant-slug': 'missing' };
    resolve.mockResolvedValue(null);

    await resolveTenant(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'TENANT_NOT_FOUND',
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow an active OWNER membership', async () => {
    req.user = { id: 'user-1', email: 'owner@example.com', role: 'ADMIN' };
    req.tenant = {
      id: 'tenant-1',
      name: 'Tenant',
      slug: 'tenant',
      status: 'ACTIVE',
      planKey: 'starter',
      customDomain: null,
    };
    getMembership.mockResolvedValue({
      id: 'membership-1',
      role: 'OWNER',
      isActive: true,
    });
    isAllowedRole.mockReturnValue(true);

    await requireTenantMembership(['OWNER', 'ADMIN'])(req as Request, res as Response, next);

    expect(req.tenantMembership).toEqual({
      id: 'membership-1',
      role: 'OWNER',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('should deny a user without an active tenant membership', async () => {
    req.user = { id: 'user-1', email: 'user@example.com', role: 'ADMIN' };
    req.tenant = {
      id: 'tenant-1',
      name: 'Tenant',
      slug: 'tenant',
      status: 'ACTIVE',
      planKey: 'starter',
      customDomain: null,
    };
    getMembership.mockResolvedValue(null);

    await requireTenantMembership(['OWNER', 'ADMIN'])(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: 'TENANT_ACCESS_DENIED',
    }));
    expect(next).not.toHaveBeenCalled();
  });
});

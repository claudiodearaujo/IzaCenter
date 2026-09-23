import { NextFunction, Request, Response } from 'express';
import { TenantMemberRole } from '@prisma/client';
import { tenantService } from '../modules/tenant/tenant.service';
import { TENANT_SLUG_HEADER } from '../modules/tenant/tenant.constants';

export async function resolveTenant(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (req.tenant) {
      next();
      return;
    }

    const headerValue = req.headers[TENANT_SLUG_HEADER];
    const explicitSlug = Array.isArray(headerValue)
      ? headerValue[0]?.trim()
      : headerValue?.trim();

    const tenant = await tenantService.resolve(explicitSlug, req.hostname);

    if (!tenant) {
      res.status(404).json({
        success: false,
        message: 'Tenant não encontrado ou inativo',
        code: 'TENANT_NOT_FOUND',
      });
      return;
    }

    req.tenant = tenant;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireTenantMembership(allowedRoles?: TenantMemberRole[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Autenticação necessária',
        });
        return;
      }

      if (!req.tenant) {
        res.status(400).json({
          success: false,
          message: 'Contexto de tenant não resolvido',
          code: 'TENANT_CONTEXT_MISSING',
        });
        return;
      }

      const membership = await tenantService.getMembership(req.tenant.id, req.user.id);

      if (!membership?.isActive || !tenantService.isAllowedRole(membership.role, allowedRoles)) {
        res.status(403).json({
          success: false,
          message: 'Usuário sem acesso ao tenant atual',
          code: 'TENANT_ACCESS_DENIED',
        });
        return;
      }

      req.tenantMembership = {
        id: membership.id,
        role: membership.role,
      };

      next();
    } catch (error) {
      next(error);
    }
  };
}

import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TenantContextService } from '../services/tenant-context.service';

export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantContext = inject(TenantContextService);

  // Professional onboarding creates a brand-new tenant and must never inherit
  // a stale explicit tenant header from a previous workspace.
  if (req.url.includes('/onboarding/professional')) {
    return next(req);
  }

  const tenantSlug = tenantContext.getTenantSlug();
  if (!tenantSlug) {
    return next(req);
  }

  return next(req.clone({
    setHeaders: {
      'X-Tenant-Slug': tenantSlug,
    },
  }));
};

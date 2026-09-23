import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  // Admin authority is tenant-scoped through TenantMembership (OWNER/ADMIN).
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isAdmin()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    router.navigate(['/cliente']);
  } else {
    router.navigate(['/auth/login']);
  }
  
  return false;
};

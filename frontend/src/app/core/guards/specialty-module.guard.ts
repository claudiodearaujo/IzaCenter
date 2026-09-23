import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { PublicSettingsStore } from '../services/public-settings.store';

export function specialtyModuleGuard(moduleKey: string): CanActivateFn {
  return () => {
    const store = inject(PublicSettingsStore);
    const router = inject(Router);

    return store.isModuleEnabled(moduleKey).pipe(
      map((enabled) => enabled ? true : router.createUrlTree(['/admin/configuracoes']))
    );
  };
}

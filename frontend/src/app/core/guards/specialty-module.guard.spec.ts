import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { firstValueFrom, of } from 'rxjs';
import { PublicSettingsStore } from '../services/public-settings.store';
import { specialtyModuleGuard } from './specialty-module.guard';

describe('specialtyModuleGuard', () => {
  let store: jasmine.SpyObj<PublicSettingsStore>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    store = jasmine.createSpyObj<PublicSettingsStore>('PublicSettingsStore', ['isModuleEnabled']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PublicSettingsStore, useValue: store },
        { provide: Router, useValue: router },
      ],
    });
  });
  function runGuard(moduleKey = 'tarot-cards') {
    const guard = specialtyModuleGuard(moduleKey);
    return TestBed.runInInjectionContext(() => guard({} as any, {} as any));
  }

  it('should allow the route when the specialty module is enabled', async () => {
    store.isModuleEnabled.and.returnValue(of(true));

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBeTrue();
    expect(store.isModuleEnabled).toHaveBeenCalledWith('tarot-cards');
    expect(router.createUrlTree).not.toHaveBeenCalled();
  });
  it('should redirect to settings when the specialty module is disabled', async () => {
    const redirect = {} as UrlTree;
    store.isModuleEnabled.and.returnValue(of(false));
    router.createUrlTree.and.returnValue(redirect);

    const result = await firstValueFrom(runGuard() as any);

    expect(result).toBe(redirect);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/admin/configuracoes']);
  });
});

import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PublicSettingsStore, DEFAULT_PUBLIC_SETTINGS } from './public-settings.store';
import { SettingsService } from './settings.service';

describe('PublicSettingsStore', () => {
  let store: PublicSettingsStore;
  let settingsService: jasmine.SpyObj<SettingsService>;

  beforeEach(() => {
    settingsService = jasmine.createSpyObj<SettingsService>('SettingsService', ['getPublicSettings']);

    TestBed.configureTestingModule({
      providers: [
        PublicSettingsStore,
        { provide: SettingsService, useValue: settingsService },
      ],
    });

    store = TestBed.inject(PublicSettingsStore);
  });

  it('should cache the public settings request', () => {
    settingsService.getPublicSettings.and.returnValue(of({
      data: {
        ...DEFAULT_PUBLIC_SETTINGS,
        siteName: 'Minha Marca',
      },
      success: true,
    } as any));

    store.load().subscribe();
    store.load().subscribe();

    expect(settingsService.getPublicSettings).toHaveBeenCalledTimes(1);
  });

  it('should merge nested defaults with configured values', () => {
    settingsService.getPublicSettings.and.returnValue(of({
      data: {
        ...DEFAULT_PUBLIC_SETTINGS,
        siteName: 'Minha Marca',
        contact: {
          ...DEFAULT_PUBLIC_SETTINGS.contact,
          email: 'contato@minhamarca.com',
        },
        content: {
          heroTitle: 'Título configurado',
        },
        professional: {
          ...DEFAULT_PUBLIC_SETTINGS.professional,
          displayName: 'Ana',
        },
        seo: {
          ...DEFAULT_PUBLIC_SETTINGS.seo,
          metaTitle: 'Ana | Minha Marca',
        },
      },
      success: true,
    } as any));

    store.load().subscribe((settings) => {
      expect(settings.siteName).toBe('Minha Marca');
      expect(settings.contact.email).toBe('contato@minhamarca.com');
      expect(settings.content.heroTitle).toBe('Título configurado');
      expect(settings.content.heroPrimaryCtaUrl).toBe('/servicos');
      expect(settings.professional.displayName).toBe('Ana');
    });
  });

  it('should fall back to neutral defaults when the API fails', () => {
    settingsService.getPublicSettings.and.returnValue(
      throwError(() => new Error('network'))
    );

    store.load().subscribe((settings) => {
      expect(settings).toEqual(DEFAULT_PUBLIC_SETTINGS);
      expect(settings.siteDescription.toLowerCase()).not.toContain('tarot');
    });
  });
});

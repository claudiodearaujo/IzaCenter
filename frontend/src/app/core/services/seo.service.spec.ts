import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './seo.service';
import { DEFAULT_PUBLIC_SETTINGS } from './public-settings.store';

describe('SeoService white-label', () => {
  let service: SeoService;
  let document: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SeoService],
    });

    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);

    document.querySelector('link[rel="icon"]')?.remove();
  });

  it('should build person and organization schemas from public settings', () => {
    service.configure({
      ...DEFAULT_PUBLIC_SETTINGS,
      siteName: 'Minha Marca',
      siteDescription: 'Atendimentos personalizados',
      logoUrl: 'https://example.com/logo.png',
      contact: {
        ...DEFAULT_PUBLIC_SETTINGS.contact,
        email: 'contato@example.com',
        phone: '+5511999999999',
        instagram: 'https://instagram.com/minhamarca',
      },
      professional: {
        ...DEFAULT_PUBLIC_SETTINGS.professional,
        displayName: 'Ana',
        professionalTitle: 'Terapeuta integrativa',
        languages: ['pt-BR', 'en'],
        serviceMode: 'HYBRID',
        location: 'São Paulo, SP',
      },
    });

    const person = service.getPersonSchema();
    const organization = service.getOrganizationSchema();

    expect(person['name']).toBe('Ana');
    expect(person['jobTitle']).toBe('Terapeuta integrativa');
    expect(person['homeLocation']).toBe('São Paulo, SP');
    expect(organization['name']).toBe('Minha Marca');
    expect(organization['description']).toBe('Atendimentos personalizados');
    expect(organization['sameAs']).toEqual(['https://instagram.com/minhamarca']);
  });

  it('should apply a configured favicon', () => {
    service.configure({
      ...DEFAULT_PUBLIC_SETTINGS,
      faviconUrl: 'https://example.com/favicon.ico',
    });

    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    expect(favicon?.href).toBe('https://example.com/favicon.ico');
  });

  it('should keep service schema generic', () => {
    service.configure(DEFAULT_PUBLIC_SETTINGS);

    const schema = service.getServiceSchema([
      { name: 'Sessão', description: 'Atendimento individual' },
    ]);

    expect(schema['serviceType']).toBe('Serviços profissionais');
    expect(JSON.stringify(schema).toLowerCase()).not.toContain('tarot');
  });
});

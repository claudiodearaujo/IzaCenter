import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';
import { PublicSettings, SettingsService } from './settings.service';

export const DEFAULT_PUBLIC_SETTINGS: PublicSettings = {
  siteName: 'Therapist Platform',
  siteDescription: 'Serviços e atendimentos profissionais em uma plataforma simples e segura.',
  enableShop: true,
  enableAppointments: true,
  enableTestimonials: true,
  contact: {
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    instagram: '',
    facebook: '',
    youtube: '',
    tiktok: '',
  },
  businessHours: [],
  content: {
    heroTitle: 'Atendimento profissional de forma simples e personalizada',
    heroSubtitle: 'Conheça os serviços disponíveis e escolha a melhor forma de atendimento para você.',
    heroPrimaryCtaLabel: 'Conhecer serviços',
    heroPrimaryCtaUrl: '/servicos',
    heroSecondaryCtaLabel: 'Conhecer o profissional',
    heroSecondaryCtaUrl: '/sobre',
    aboutTitle: 'Conheça o profissional',
    aboutContent: 'Apresente aqui sua trajetória, abordagem e forma de trabalho.',
    servicesTitle: 'Serviços',
    servicesSubtitle: 'Escolha o serviço que melhor atende ao seu momento.',
    ctaTitle: 'Pronto para começar?',
    ctaSubtitle: 'Conheça as opções disponíveis ou entre em contato para tirar dúvidas.',
    ctaButtonLabel: 'Ver serviços',
    ctaButtonUrl: '/servicos',
    footerText: 'Atendimento profissional com informação clara e experiência personalizada.',
    footerDisclaimer: 'As informações e serviços apresentados não substituem orientação profissional regulamentada quando aplicável.',
  },
  heroTitle: 'Atendimento profissional de forma simples e personalizada',
  heroSubtitle: 'Conheça os serviços disponíveis e escolha a melhor forma de atendimento para você.',
  footerText: 'Atendimento profissional com informação clara e experiência personalizada.',
  professional: {
    displayName: 'Profissional',
    professionalTitle: 'Profissional de atendimento',
    bio: '',
    photoUrl: '',
    languages: ['pt-BR'],
    serviceMode: 'ONLINE',
    location: '',
    credentials: [],
  },
  specialties: [],
  enabledModules: [],
  seo: {
    metaTitle: 'Therapist Platform',
    metaDescription: 'Serviços e atendimentos profissionais em uma plataforma simples e segura.',
    keywords: ['atendimento', 'serviços', 'profissional'],
  },
  branding: {
    primaryColor: '#F59E0B',
    secondaryColor: '#EC4899',
    accentColor: '#D4AF37',
    surfaceColor: '#FEFDFB',
    textColor: '#2D2A24',
    logoUrl: '',
    faviconUrl: '',
    fontFamily: 'Nunito, Open Sans, sans-serif',
    borderRadius: '12px',
  },
};

@Injectable({ providedIn: 'root' })
export class PublicSettingsStore {
  private settingsService = inject(SettingsService);
  private cache$?: Observable<PublicSettings>;

  load(): Observable<PublicSettings> {
    if (!this.cache$) {
      this.cache$ = this.settingsService.getPublicSettings().pipe(
        map((response) => this.mergeDefaults(response.data)),
        catchError(() => of(DEFAULT_PUBLIC_SETTINGS)),
        shareReplay({ bufferSize: 1, refCount: false })
      );
    }
    return this.cache$;
  }

  refresh(): Observable<PublicSettings> {
    this.cache$ = undefined;
    return this.load();
  }

  isModuleEnabled(moduleKey: string): Observable<boolean> {
    return this.load().pipe(
      map((settings) => settings.enabledModules.includes(moduleKey))
    );
  }

  private mergeDefaults(data: PublicSettings): PublicSettings {
    return {
      ...DEFAULT_PUBLIC_SETTINGS,
      ...data,
      contact: { ...DEFAULT_PUBLIC_SETTINGS.contact, ...(data.contact || {}) },
      content: { ...DEFAULT_PUBLIC_SETTINGS.content, ...(data.content || {}) },
      professional: {
        ...DEFAULT_PUBLIC_SETTINGS.professional,
        ...(data.professional || {}),
        languages: data.professional?.languages || DEFAULT_PUBLIC_SETTINGS.professional.languages,
        credentials: data.professional?.credentials || DEFAULT_PUBLIC_SETTINGS.professional.credentials,
      },
      specialties: data.specialties || [],
      enabledModules: data.enabledModules || [],
      businessHours: data.businessHours || [],
      seo: {
        ...DEFAULT_PUBLIC_SETTINGS.seo,
        ...(data.seo || {}),
        keywords: data.seo?.keywords || DEFAULT_PUBLIC_SETTINGS.seo.keywords,
      },
      branding: {
        ...DEFAULT_PUBLIC_SETTINGS.branding,
        ...(data.branding || {}),
      },
    };
  }
}

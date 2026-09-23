// apps/backend/src/modules/settings/settings.service.ts

import { prisma } from '../../config/database';
import { DEFAULT_TENANT_ID } from '../tenant/tenant.constants';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableShop: boolean;
  enableAppointments: boolean;
  enableTestimonials: boolean;
}

interface ContactSettings {
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
}

interface BusinessHour {
  day: string;
  dayName: string;
  isOpen: boolean;
  start?: string;
  end?: string;
}

interface ContentSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCtaLabel?: string;
  heroPrimaryCtaUrl?: string;
  heroSecondaryCtaLabel?: string;
  heroSecondaryCtaUrl?: string;
  aboutTitle?: string;
  aboutContent?: string;
  servicesTitle?: string;
  servicesSubtitle?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonLabel?: string;
  ctaButtonUrl?: string;
  footerText?: string;
  footerDisclaimer?: string;
  privacyPolicy?: string;
  termsOfService?: string;
}

interface ProfessionalSettings {
  displayName: string;
  professionalTitle: string;
  bio?: string;
  photoUrl?: string;
  languages: string[];
  serviceMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location?: string;
  credentials: string[];
}

interface SpecialtySettings {
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  usesCardModule: boolean;
  moduleKey?: string;
  disclaimer?: string;
}

interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

interface BrandingSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  surfaceColor: string;
  textColor: string;
  logoUrl?: string;
  faviconUrl?: string;
  fontFamily: string;
  borderRadius: string;
}

interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableAnalytics: boolean;
}

export class SettingsService {
  private async getSetting(key: string, tenantId = DEFAULT_TENANT_ID): Promise<any> {
    const setting = await prisma.siteSetting.findUnique({
      where: {
        tenantId_key: { tenantId, key },
      },
    });

    return setting?.value ? setting.value : null;
  }

  private async setSetting(key: string, value: any, tenantId = DEFAULT_TENANT_ID): Promise<void> {
    await prisma.siteSetting.upsert({
      where: {
        tenantId_key: { tenantId, key },
      },
      update: { value },
      create: { tenantId, key, value },
    });
  }

  // General Settings
  async getGeneral(tenantId = DEFAULT_TENANT_ID): Promise<{ data: GeneralSettings }> {
    const settings = await this.getSetting('general', tenantId);
    
    return {
      data: settings || {
        siteName: 'Therapist Platform',
        siteDescription: 'Plataforma de serviços e atendimentos profissionais',
        enableShop: true,
        enableAppointments: true,
        enableTestimonials: true,
      },
    };
  }

  async updateGeneral(data: Partial<GeneralSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: GeneralSettings }> {
    const current = (await this.getGeneral(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('general', updated, tenantId);
    return { data: updated };
  }

  // Contact Settings
  async getContact(tenantId = DEFAULT_TENANT_ID): Promise<{ data: ContactSettings }> {
    const settings = await this.getSetting('contact', tenantId);

    return {
      data: settings || {
        email: '',
        phone: '',
        whatsapp: '',
      },
    };
  }

  async updateContact(data: Partial<ContactSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: ContactSettings }> {
    const current = (await this.getContact(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('contact', updated, tenantId);
    return { data: updated };
  }

  // Business Hours
  async getBusinessHours(tenantId = DEFAULT_TENANT_ID): Promise<{ data: BusinessHour[] }> {
    const settings = await this.getSetting('businessHours', tenantId);

    return {
      data: settings || [
        { day: 'monday', dayName: 'Segunda-feira', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'tuesday', dayName: 'Terça-feira', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'wednesday', dayName: 'Quarta-feira', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'thursday', dayName: 'Quinta-feira', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'friday', dayName: 'Sexta-feira', isOpen: true, start: '09:00', end: '18:00' },
        { day: 'saturday', dayName: 'Sábado', isOpen: false },
        { day: 'sunday', dayName: 'Domingo', isOpen: false },
      ],
    };
  }

  async updateBusinessHours(data: BusinessHour[], tenantId = DEFAULT_TENANT_ID): Promise<{ data: BusinessHour[] }> {
    await this.setSetting('businessHours', data, tenantId);
    return { data };
  }

  // Content Settings
  async getContent(tenantId = DEFAULT_TENANT_ID): Promise<{ data: ContentSettings }> {
    const settings = await this.getSetting('content', tenantId);

    return {
      data: settings || {
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
    };
  }

  async updateContent(data: Partial<ContentSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: ContentSettings }> {
    const current = (await this.getContent(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('content', updated, tenantId);
    return { data: updated };
  }

  // Professional Settings
  async getProfessional(tenantId = DEFAULT_TENANT_ID): Promise<{ data: ProfessionalSettings }> {
    const settings = await this.getSetting('professional', tenantId);

    return {
      data: settings || {
        displayName: 'Profissional',
        professionalTitle: 'Profissional de atendimento',
        bio: '',
        photoUrl: '',
        languages: ['pt-BR'],
        serviceMode: 'ONLINE',
        location: '',
        credentials: [],
      },
    };
  }

  async updateProfessional(data: Partial<ProfessionalSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: ProfessionalSettings }> {
    const current = (await this.getProfessional(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('professional', updated, tenantId);
    return { data: updated };
  }

  // Specialty Settings
  async getSpecialties(tenantId = DEFAULT_TENANT_ID): Promise<{ data: SpecialtySettings[] }> {
    const settings = await this.getSetting('specialties', tenantId);
    return { data: settings || [] };
  }

  async updateSpecialties(data: SpecialtySettings[], tenantId = DEFAULT_TENANT_ID): Promise<{ data: SpecialtySettings[] }> {
    await this.setSetting('specialties', data, tenantId);
    return { data };
  }

  private resolveEnabledSpecialtyModules(specialties: SpecialtySettings[]): string[] {
    const modules = new Set<string>();

    for (const specialty of specialties) {
      if (!specialty.isActive) continue;

      if (specialty.moduleKey) {
        modules.add(specialty.moduleKey);
      }

      if (specialty.usesCardModule) {
        modules.add('tarot-cards');
      }
    }

    return [...modules].sort();
  }

  async getEnabledSpecialtyModules(tenantId = DEFAULT_TENANT_ID): Promise<string[]> {
    const specialties = (await this.getSpecialties(tenantId)).data;
    return this.resolveEnabledSpecialtyModules(specialties);
  }

  async isSpecialtyModuleEnabled(moduleKey: string, tenantId = DEFAULT_TENANT_ID): Promise<boolean> {
    const modules = await this.getEnabledSpecialtyModules(tenantId);
    return modules.includes(moduleKey);
  }

  // SEO Settings
  async getSeo(tenantId = DEFAULT_TENANT_ID): Promise<{ data: SeoSettings }> {
    const settings = await this.getSetting('seo', tenantId);

    return {
      data: settings || {
        metaTitle: 'Therapist Platform',
        metaDescription: 'Serviços e atendimentos profissionais em uma plataforma simples e segura.',
        keywords: ['atendimento', 'serviços', 'profissional'],
      },
    };
  }

  async updateSeo(data: Partial<SeoSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: SeoSettings }> {
    const current = (await this.getSeo(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('seo', updated, tenantId);
    return { data: updated };
  }

  // Branding Settings
  async getBranding(tenantId = DEFAULT_TENANT_ID): Promise<{ data: BrandingSettings }> {
    const settings = await this.getSetting('branding', tenantId);

    return {
      data: settings || {
        primaryColor: '#4f46e5',
        secondaryColor: '#7c3aed',
        accentColor: '#0ea5e9',
        surfaceColor: '#ffffff',
        textColor: '#111827',
        logoUrl: '',
        faviconUrl: '',
        fontFamily: 'Inter, sans-serif',
        borderRadius: '12px',
      },
    };
  }

  async updateBranding(data: Partial<BrandingSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: BrandingSettings }> {
    const current = (await this.getBranding(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('branding', updated, tenantId);
    return { data: updated };
  }

  // Analytics Settings
  async getAnalytics(tenantId = DEFAULT_TENANT_ID): Promise<{ data: AnalyticsSettings }> {
    const settings = await this.getSetting('analytics', tenantId);

    return {
      data: settings || {
        enableAnalytics: false,
      },
    };
  }

  async updateAnalytics(data: Partial<AnalyticsSettings>, tenantId = DEFAULT_TENANT_ID): Promise<{ data: AnalyticsSettings }> {
    const current = (await this.getAnalytics(tenantId)).data;
    const updated = { ...current, ...data };
    await this.setSetting('analytics', updated, tenantId);
    return { data: updated };
  }

  // Get all settings at once
  async getAll(tenantId = DEFAULT_TENANT_ID) {
    const [general, contact, businessHours, content, professional, specialties, seo, branding, analytics] = await Promise.all([
      this.getGeneral(tenantId),
      this.getContact(tenantId),
      this.getBusinessHours(tenantId),
      this.getContent(tenantId),
      this.getProfessional(tenantId),
      this.getSpecialties(tenantId),
      this.getSeo(tenantId),
      this.getBranding(tenantId),
      this.getAnalytics(tenantId),
    ]);

    return {
      data: {
        general: general.data,
        contact: contact.data,
        businessHours: businessHours.data,
        content: content.data,
        professional: professional.data,
        specialties: specialties.data,
        enabledModules: this.resolveEnabledSpecialtyModules(specialties.data),
        seo: seo.data,
        branding: branding.data,
        analytics: analytics.data,
      },
    };
  }

  // Get public settings (for frontend)
  async getPublic(tenantId = DEFAULT_TENANT_ID) {
    const [general, contact, businessHours, content, professional, specialties, seo, branding] = await Promise.all([
      this.getGeneral(tenantId),
      this.getContact(tenantId),
      this.getBusinessHours(tenantId),
      this.getContent(tenantId),
      this.getProfessional(tenantId),
      this.getSpecialties(tenantId),
      this.getSeo(tenantId),
      this.getBranding(tenantId),
    ]);

    return {
      data: {
        siteName: general.data.siteName,
        siteDescription: general.data.siteDescription,
        logoUrl: general.data.logoUrl,
        faviconUrl: general.data.faviconUrl,
        enableShop: general.data.enableShop,
        enableAppointments: general.data.enableAppointments,
        enableTestimonials: general.data.enableTestimonials,
        contact: {
          email: contact.data.email,
          phone: contact.data.phone,
          whatsapp: contact.data.whatsapp,
          instagram: contact.data.instagram,
          facebook: contact.data.facebook,
          youtube: contact.data.youtube,
          tiktok: contact.data.tiktok,
          address: contact.data.address,
        },
        businessHours: businessHours.data,
        content: content.data,
        heroTitle: content.data.heroTitle,
        heroSubtitle: content.data.heroSubtitle,
        footerText: content.data.footerText,
        professional: professional.data,
        specialties: specialties.data.filter((specialty) => specialty.isActive),
        enabledModules: this.resolveEnabledSpecialtyModules(specialties.data),
        seo: seo.data,
        branding: branding.data,
      },
    };
  }
}

export const settingsService = new SettingsService();

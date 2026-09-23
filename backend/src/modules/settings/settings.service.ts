// apps/backend/src/modules/settings/settings.service.ts

import { prisma } from '../../config/database';

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

interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableAnalytics: boolean;
}

export class SettingsService {
  private async getSetting(key: string): Promise<any> {
    const setting = await prisma.siteSetting.findUnique({
      where: { key },
    });

    return setting?.value ? setting.value : null;
  }

  private async setSetting(key: string, value: any): Promise<void> {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // General Settings
  async getGeneral(): Promise<{ data: GeneralSettings }> {
    const settings = await this.getSetting('general');
    
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

  async updateGeneral(data: Partial<GeneralSettings>): Promise<{ data: GeneralSettings }> {
    const current = (await this.getGeneral()).data;
    const updated = { ...current, ...data };
    await this.setSetting('general', updated);
    return { data: updated };
  }

  // Contact Settings
  async getContact(): Promise<{ data: ContactSettings }> {
    const settings = await this.getSetting('contact');

    return {
      data: settings || {
        email: '',
        phone: '',
        whatsapp: '',
      },
    };
  }

  async updateContact(data: Partial<ContactSettings>): Promise<{ data: ContactSettings }> {
    const current = (await this.getContact()).data;
    const updated = { ...current, ...data };
    await this.setSetting('contact', updated);
    return { data: updated };
  }

  // Business Hours
  async getBusinessHours(): Promise<{ data: BusinessHour[] }> {
    const settings = await this.getSetting('businessHours');

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

  async updateBusinessHours(data: BusinessHour[]): Promise<{ data: BusinessHour[] }> {
    await this.setSetting('businessHours', data);
    return { data };
  }

  // Content Settings
  async getContent(): Promise<{ data: ContentSettings }> {
    const settings = await this.getSetting('content');

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

  async updateContent(data: Partial<ContentSettings>): Promise<{ data: ContentSettings }> {
    const current = (await this.getContent()).data;
    const updated = { ...current, ...data };
    await this.setSetting('content', updated);
    return { data: updated };
  }

  // Professional Settings
  async getProfessional(): Promise<{ data: ProfessionalSettings }> {
    const settings = await this.getSetting('professional');

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

  async updateProfessional(data: Partial<ProfessionalSettings>): Promise<{ data: ProfessionalSettings }> {
    const current = (await this.getProfessional()).data;
    const updated = { ...current, ...data };
    await this.setSetting('professional', updated);
    return { data: updated };
  }

  // Specialty Settings
  async getSpecialties(): Promise<{ data: SpecialtySettings[] }> {
    const settings = await this.getSetting('specialties');
    return { data: settings || [] };
  }

  async updateSpecialties(data: SpecialtySettings[]): Promise<{ data: SpecialtySettings[] }> {
    await this.setSetting('specialties', data);
    return { data };
  }

  async getEnabledSpecialtyModules(): Promise<string[]> {
    const specialties = (await this.getSpecialties()).data;
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

  async isSpecialtyModuleEnabled(moduleKey: string): Promise<boolean> {
    const modules = await this.getEnabledSpecialtyModules();
    return modules.includes(moduleKey);
  }

  // SEO Settings
  async getSeo(): Promise<{ data: SeoSettings }> {
    const settings = await this.getSetting('seo');

    return {
      data: settings || {
        metaTitle: 'Therapist Platform',
        metaDescription: 'Serviços e atendimentos profissionais em uma plataforma simples e segura.',
        keywords: ['atendimento', 'serviços', 'profissional'],
      },
    };
  }

  async updateSeo(data: Partial<SeoSettings>): Promise<{ data: SeoSettings }> {
    const current = (await this.getSeo()).data;
    const updated = { ...current, ...data };
    await this.setSetting('seo', updated);
    return { data: updated };
  }

  // Analytics Settings
  async getAnalytics(): Promise<{ data: AnalyticsSettings }> {
    const settings = await this.getSetting('analytics');

    return {
      data: settings || {
        enableAnalytics: false,
      },
    };
  }

  async updateAnalytics(data: Partial<AnalyticsSettings>): Promise<{ data: AnalyticsSettings }> {
    const current = (await this.getAnalytics()).data;
    const updated = { ...current, ...data };
    await this.setSetting('analytics', updated);
    return { data: updated };
  }

  // Get all settings at once
  async getAll() {
    const [general, contact, businessHours, content, professional, specialties, seo, analytics] = await Promise.all([
      this.getGeneral(),
      this.getContact(),
      this.getBusinessHours(),
      this.getContent(),
      this.getProfessional(),
      this.getSpecialties(),
      this.getSeo(),
      this.getAnalytics(),
    ]);

    return {
      data: {
        general: general.data,
        contact: contact.data,
        businessHours: businessHours.data,
        content: content.data,
        professional: professional.data,
        specialties: specialties.data,
        seo: seo.data,
        analytics: analytics.data,
      },
    };
  }

  // Get public settings (for frontend)
  async getPublic() {
    const [general, contact, businessHours, content, professional, specialties, seo] = await Promise.all([
      this.getGeneral(),
      this.getContact(),
      this.getBusinessHours(),
      this.getContent(),
      this.getProfessional(),
      this.getSpecialties(),
      this.getSeo(),
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
        enabledModules: await this.getEnabledSpecialtyModules(),
        seo: seo.data,
      },
    };
  }
}

export const settingsService = new SettingsService();

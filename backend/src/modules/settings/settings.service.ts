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
  aboutTitle?: string;
  aboutContent?: string;
  footerText?: string;
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
    const [general, contact, content, professional, specialties, seo] = await Promise.all([
      this.getGeneral(),
      this.getContact(),
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
        },
        heroTitle: content.data.heroTitle,
        heroSubtitle: content.data.heroSubtitle,
        footerText: content.data.footerText,
        professional: professional.data,
        specialties: specialties.data.filter((specialty) => specialty.isActive),
        seo: seo.data,
      },
    };
  }
}

export const settingsService = new SettingsService();

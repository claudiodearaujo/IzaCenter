// apps/frontend/src/app/core/services/settings.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableShop?: boolean;
  enableAppointments?: boolean;
  enableTestimonials?: boolean;
  maintenanceMode?: boolean;
}

export interface ContactSettings {
  email: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
  tiktok?: string;
  // Aliases for backward compatibility
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

export interface BusinessHour {
  day: string;
  dayName: string;
  isOpen: boolean;
  start?: string;
  end?: string;
}

export interface ContentSettings {
  heroTitle?: string;
  heroSubtitle?: string;
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
  // Aliases for backward compatibility
  homeTitle?: string;
  homeSubtitle?: string;
  aboutText?: string;
  privacyPolicy?: string;
  termsOfService?: string;
}

export interface ProfessionalSettings {
  displayName: string;
  professionalTitle: string;
  bio?: string;
  photoUrl?: string;
  languages: string[];
  serviceMode: 'ONLINE' | 'IN_PERSON' | 'HYBRID';
  location?: string;
  credentials: string[];
}

export interface SpecialtySettings {
  slug: string;
  name: string;
  description?: string;
  isActive: boolean;
  usesCardModule: boolean;
  moduleKey?: string;
  disclaimer?: string;
}

export interface SeoSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  hotjarId?: string;
  enableAnalytics?: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  businessHours: BusinessHour[];
  content: ContentSettings;
  professional: ProfessionalSettings;
  specialties: SpecialtySettings[];
  seo: SeoSettings;
  analytics: AnalyticsSettings;
}

export interface PublicSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableShop: boolean;
  enableAppointments: boolean;
  enableTestimonials: boolean;
  contact: {
    email: string;
    phone?: string;
    whatsapp?: string;
    address?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };
  businessHours: BusinessHour[];
  content: ContentSettings;
  heroTitle: string;
  heroSubtitle: string;
  footerText?: string;
  professional: ProfessionalSettings;
  specialties: SpecialtySettings[];
  enabledModules: string[];
  seo: SeoSettings;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(ApiService);

  // Public methods
  getPublicSettings(): Observable<ApiResponse<PublicSettings>> {
    return this.api.get<ApiResponse<PublicSettings>>('/settings/public');
  }

  // Admin methods
  getAll(): Observable<ApiResponse<AllSettings>> {
    return this.api.get<ApiResponse<AllSettings>>('/admin/settings');
  }

  getGeneral(): Observable<ApiResponse<GeneralSettings>> {
    return this.api.get<ApiResponse<GeneralSettings>>('/admin/settings/general');
  }

  updateGeneral(data: Partial<GeneralSettings>): Observable<ApiResponse<GeneralSettings>> {
    return this.api.put<ApiResponse<GeneralSettings>>('/admin/settings/general', data);
  }

  getContact(): Observable<ApiResponse<ContactSettings>> {
    return this.api.get<ApiResponse<ContactSettings>>('/admin/settings/contact');
  }

  updateContact(data: Partial<ContactSettings>): Observable<ApiResponse<ContactSettings>> {
    return this.api.put<ApiResponse<ContactSettings>>('/admin/settings/contact', data);
  }

  getBusinessHours(): Observable<ApiResponse<BusinessHour[]>> {
    return this.api.get<ApiResponse<BusinessHour[]>>('/admin/settings/business-hours');
  }

  updateBusinessHours(data: BusinessHour[]): Observable<ApiResponse<BusinessHour[]>> {
    return this.api.put<ApiResponse<BusinessHour[]>>('/admin/settings/business-hours', data);
  }

  getContent(): Observable<ApiResponse<ContentSettings>> {
    return this.api.get<ApiResponse<ContentSettings>>('/admin/settings/content');
  }

  updateContent(data: Partial<ContentSettings>): Observable<ApiResponse<ContentSettings>> {
    return this.api.put<ApiResponse<ContentSettings>>('/admin/settings/content', data);
  }

  getProfessional(): Observable<ApiResponse<ProfessionalSettings>> {
    return this.api.get<ApiResponse<ProfessionalSettings>>('/admin/settings/professional');
  }

  updateProfessional(data: Partial<ProfessionalSettings>): Observable<ApiResponse<ProfessionalSettings>> {
    return this.api.put<ApiResponse<ProfessionalSettings>>('/admin/settings/professional', data);
  }

  getSpecialties(): Observable<ApiResponse<SpecialtySettings[]>> {
    return this.api.get<ApiResponse<SpecialtySettings[]>>('/admin/settings/specialties');
  }

  updateSpecialties(data: SpecialtySettings[]): Observable<ApiResponse<SpecialtySettings[]>> {
    return this.api.put<ApiResponse<SpecialtySettings[]>>('/admin/settings/specialties', data);
  }

  getSeo(): Observable<ApiResponse<SeoSettings>> {
    return this.api.get<ApiResponse<SeoSettings>>('/admin/settings/seo');
  }

  updateSeo(data: Partial<SeoSettings>): Observable<ApiResponse<SeoSettings>> {
    return this.api.put<ApiResponse<SeoSettings>>('/admin/settings/seo', data);
  }

  getAnalytics(): Observable<ApiResponse<AnalyticsSettings>> {
    return this.api.get<ApiResponse<AnalyticsSettings>>('/admin/settings/analytics');
  }

  updateAnalytics(data: Partial<AnalyticsSettings>): Observable<ApiResponse<AnalyticsSettings>> {
    return this.api.put<ApiResponse<AnalyticsSettings>>('/admin/settings/analytics', data);
  }

  // Alias methods for backward compatibility
  getAllSettings(): Observable<ApiResponse<AllSettings>> {
    return this.getAll();
  }

  updateGeneralSettings(data: Partial<GeneralSettings>): Observable<ApiResponse<GeneralSettings>> {
    return this.updateGeneral(data);
  }

  updateContactSettings(data: Partial<ContactSettings>): Observable<ApiResponse<ContactSettings>> {
    return this.updateContact(data);
  }

  updateContentSettings(data: Partial<ContentSettings>): Observable<ApiResponse<ContentSettings>> {
    return this.updateContent(data);
  }

  updateAnalyticsSettings(data: Partial<AnalyticsSettings>): Observable<ApiResponse<AnalyticsSettings>> {
    return this.updateAnalytics(data);
  }
}

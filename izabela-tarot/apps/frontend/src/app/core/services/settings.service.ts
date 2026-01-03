// apps/frontend/src/app/core/services/settings.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  enableShop: boolean;
  enableAppointments: boolean;
  enableTestimonials: boolean;
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
}

export interface BusinessHour {
  day: string;
  dayName: string;
  isOpen: boolean;
  start?: string;
  end?: string;
}

export interface ContentSettings {
  heroTitle: string;
  heroSubtitle: string;
  aboutTitle?: string;
  aboutContent?: string;
  footerText?: string;
}

export interface AnalyticsSettings {
  googleAnalyticsId?: string;
  facebookPixelId?: string;
  enableAnalytics: boolean;
}

export interface AllSettings {
  general: GeneralSettings;
  contact: ContactSettings;
  businessHours: BusinessHour[];
  content: ContentSettings;
  analytics: AnalyticsSettings;
}

export interface PublicSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  enableShop: boolean;
  enableAppointments: boolean;
  enableTestimonials: boolean;
  contact: {
    email: string;
    phone?: string;
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    youtube?: string;
  };
  heroTitle: string;
  heroSubtitle: string;
  footerText?: string;
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

  getAnalytics(): Observable<ApiResponse<AnalyticsSettings>> {
    return this.api.get<ApiResponse<AnalyticsSettings>>('/admin/settings/analytics');
  }

  updateAnalytics(data: Partial<AnalyticsSettings>): Observable<ApiResponse<AnalyticsSettings>> {
    return this.api.put<ApiResponse<AnalyticsSettings>>('/admin/settings/analytics', data);
  }
}

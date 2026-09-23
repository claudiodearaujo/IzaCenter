// apps/frontend/src/app/features/admin/settings/settings.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  SettingsService,
  GeneralSettings,
  ContactSettings,
  BusinessHour,
  ContentSettings,
  AnalyticsSettings,
  ProfessionalSettings,
  SpecialtySettings,
  SeoSettings,
} from '../../../core/services/settings.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ToggleButtonModule,
    FileUploadModule,
    DividerModule,
    EditorModule,
    TranslateModule,
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  loading = signal(true);
  saving = signal(false);
  activeTab = signal(0);

  // Unified settings object for template binding
  settings: {
    siteName: string;
    siteDescription: string;
    siteKeywords?: string;
    logoUrl?: string;
    faviconUrl?: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    allowTestimonials: boolean;
    allowOnlinePayment: boolean;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    instagramUrl: string;
    facebookUrl: string;
    youtubeUrl: string;
    tiktokUrl: string;
    businessHours: string;
    workingDays: string;
    appointmentNotice: number;
    homeHeroTitle: string;
    homeHeroSubtitle: string;
    aboutText: string;
    servicesTitle: string;
    servicesSubtitle: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaButtonLabel: string;
    ctaButtonUrl: string;
    footerText: string;
    footerDisclaimer: string;
    privacyPolicy: string;
    termsOfService: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
  } = {
    siteName: 'Therapist Platform',
    siteDescription: 'Plataforma de serviços e atendimentos profissionais',
    siteKeywords: '',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
    allowRegistration: true,
    allowTestimonials: true,
    allowOnlinePayment: true,
    email: 'contato@example.com',
    phone: '',
    whatsapp: '',
    address: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
    tiktokUrl: '',
    businessHours: '09:00 - 18:00',
    workingDays: 'Segunda a Sexta',
    appointmentNotice: 24,
    homeHeroTitle: 'Therapist Platform',
    homeHeroSubtitle: 'Serviços e atendimentos personalizados em um só lugar',
    aboutText: '',
    servicesTitle: 'Serviços',
    servicesSubtitle: 'Escolha o serviço que melhor atende ao seu momento.',
    ctaTitle: 'Pronto para começar?',
    ctaSubtitle: 'Conheça as opções disponíveis ou entre em contato para tirar dúvidas.',
    ctaButtonLabel: 'Ver serviços',
    ctaButtonUrl: '/servicos',
    footerText: 'Atendimento profissional com informação clara e experiência personalizada.',
    footerDisclaimer: 'As informações e serviços apresentados não substituem orientação profissional regulamentada quando aplicável.',
    privacyPolicy: '',
    termsOfService: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
  };

  generalSettings: GeneralSettings = {
    siteName: 'Therapist Platform',
    siteDescription: 'Plataforma de serviços e atendimentos profissionais',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
  };

  contactSettings: ContactSettings = {
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
  };

  businessHours: BusinessHour[] = [];

  contentSettings: ContentSettings = {
    heroTitle: 'Atendimento profissional de forma simples e personalizada',
    heroSubtitle: 'Conheça os serviços disponíveis e escolha a melhor forma de atendimento para você.',
    heroPrimaryCtaLabel: 'Conhecer serviços',
    heroPrimaryCtaUrl: '/servicos',
    heroSecondaryCtaLabel: 'Conhecer o profissional',
    heroSecondaryCtaUrl: '/sobre',
    aboutTitle: 'Conheça o profissional',
    aboutContent: '',
    servicesTitle: 'Serviços',
    servicesSubtitle: 'Escolha o serviço que melhor atende ao seu momento.',
    ctaTitle: 'Pronto para começar?',
    ctaSubtitle: 'Conheça as opções disponíveis ou entre em contato para tirar dúvidas.',
    ctaButtonLabel: 'Ver serviços',
    ctaButtonUrl: '/servicos',
    footerText: 'Atendimento profissional com informação clara e experiência personalizada.',
    footerDisclaimer: 'As informações e serviços apresentados não substituem orientação profissional regulamentada quando aplicável.',
    privacyPolicy: '',
    termsOfService: '',
  };

  analyticsSettings: AnalyticsSettings = {
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
  };

  professionalSettings: ProfessionalSettings = {
    displayName: 'Profissional',
    professionalTitle: 'Profissional de atendimento',
    bio: '',
    photoUrl: '',
    languages: ['pt-BR'],
    serviceMode: 'ONLINE',
    location: '',
    credentials: [],
  };

  specialties: SpecialtySettings[] = [];
  seoSettings: SeoSettings = {
    metaTitle: 'Therapist Platform',
    metaDescription: 'Serviços e atendimentos profissionais em uma plataforma simples e segura.',
    keywords: ['atendimento', 'serviços', 'profissional'],
  };

  languagesText = 'pt-BR';
  credentialsText = '';
  specialtiesText = '';
  cardModuleSpecialtiesText = '';
  seoKeywordsText = 'atendimento, serviços, profissional';

  logoPreview = signal<string | null>(null);
  faviconPreview = signal<string | null>(null);

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.loading.set(true);

    this.settingsService.getAllSettings().subscribe({
      next: (response) => {
        const data = response.data;
        this.generalSettings = data.general || this.generalSettings;
        this.contactSettings = data.contact || this.contactSettings;
        this.businessHours = data.businessHours || [];
        this.contentSettings = data.content || this.contentSettings;
        this.professionalSettings = data.professional || this.professionalSettings;
        this.specialties = data.specialties || [];
        this.seoSettings = data.seo || this.seoSettings;
        this.analyticsSettings = data.analytics || this.analyticsSettings;
        this.languagesText = this.professionalSettings.languages.join(', ');
        this.credentialsText = this.professionalSettings.credentials.join('\n');
        this.specialtiesText = this.specialties.map((specialty) => specialty.name).join('\n');
        this.cardModuleSpecialtiesText = this.specialties
          .filter((specialty) => specialty.usesCardModule || specialty.moduleKey === 'tarot-cards')
          .map((specialty) => specialty.name)
          .join('\n');
        this.seoKeywordsText = this.seoSettings.keywords.join(', ');
        
        // Populate unified settings object
        this.settings = {
          ...this.settings,
          siteName: this.generalSettings.siteName || '',
          siteDescription: this.generalSettings.siteDescription || '',
          logoUrl: this.generalSettings.logoUrl,
          faviconUrl: this.generalSettings.faviconUrl,
          maintenanceMode: this.generalSettings.maintenanceMode || false,
          email: this.contactSettings.email || '',
          phone: this.contactSettings.phone || '',
          whatsapp: this.contactSettings.whatsapp || '',
          address: this.contactSettings.address || '',
          instagramUrl: this.contactSettings.instagram || this.contactSettings.instagramUrl || '',
          facebookUrl: this.contactSettings.facebook || this.contactSettings.facebookUrl || '',
          youtubeUrl: this.contactSettings.youtube || this.contactSettings.youtubeUrl || '',
          tiktokUrl: this.contactSettings.tiktok || '',
          homeHeroTitle: this.contentSettings.heroTitle || this.contentSettings.homeTitle || '',
          homeHeroSubtitle: this.contentSettings.heroSubtitle || this.contentSettings.homeSubtitle || '',
          aboutText: this.contentSettings.aboutContent || this.contentSettings.aboutText || '',
          servicesTitle: this.contentSettings.servicesTitle || 'Serviços',
          servicesSubtitle: this.contentSettings.servicesSubtitle || '',
          ctaTitle: this.contentSettings.ctaTitle || '',
          ctaSubtitle: this.contentSettings.ctaSubtitle || '',
          ctaButtonLabel: this.contentSettings.ctaButtonLabel || '',
          ctaButtonUrl: this.contentSettings.ctaButtonUrl || '/servicos',
          footerText: this.contentSettings.footerText || '',
          footerDisclaimer: this.contentSettings.footerDisclaimer || '',
          privacyPolicy: this.contentSettings.privacyPolicy || '',
          termsOfService: this.contentSettings.termsOfService || '',
          googleAnalyticsId: this.analyticsSettings.googleAnalyticsId || '',
          facebookPixelId: this.analyticsSettings.facebookPixelId || '',
          hotjarId: this.analyticsSettings.hotjarId || '',
        };
        
        if (this.generalSettings.logoUrl) {
          this.logoPreview.set(this.generalSettings.logoUrl);
        }
        if (this.generalSettings.faviconUrl) {
          this.faviconPreview.set(this.generalSettings.faviconUrl);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  saveSettings() {
    this.saving.set(true);
    this.syncUnifiedSettings();
    this.normalizeDomainSettings();

    forkJoin([
      this.settingsService.updateGeneralSettings(this.generalSettings),
      this.settingsService.updateContactSettings(this.contactSettings),
      this.settingsService.updateBusinessHours(this.businessHours),
      this.settingsService.updateContentSettings(this.contentSettings),
      this.settingsService.updateAnalyticsSettings(this.analyticsSettings),
      this.settingsService.updateProfessional(this.professionalSettings),
      this.settingsService.updateSpecialties(this.specialties),
      this.settingsService.updateSeo(this.seoSettings),
    ]).subscribe({
      next: () => {
        this.notification.success('Configurações white-label salvas com sucesso.');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveGeneralSettings() {
    this.saving.set(true);
    this.syncUnifiedSettings();
    this.settingsService.updateGeneralSettings(this.generalSettings).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.settings.generalSaved'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveContactSettings() {
    this.saving.set(true);
    this.syncUnifiedSettings();
    this.settingsService.updateContactSettings(this.contactSettings).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.settings.contactSaved'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveBusinessHours() {
    this.saving.set(true);
    this.settingsService.updateBusinessHours(this.businessHours).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.settings.hoursSaved'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveContentSettings() {
    this.saving.set(true);
    this.syncUnifiedSettings();
    this.settingsService.updateContentSettings(this.contentSettings).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.settings.contentSaved'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveAnalyticsSettings() {
    this.saving.set(true);
    this.syncUnifiedSettings();
    this.settingsService.updateAnalyticsSettings(this.analyticsSettings).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('admin.settings.analyticsSaved'));
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  saveDomainSettings() {
    this.saving.set(true);
    this.normalizeDomainSettings();

    forkJoin([
      this.settingsService.updateProfessional(this.professionalSettings),
      this.settingsService.updateSpecialties(this.specialties),
      this.settingsService.updateSeo(this.seoSettings),
    ]).subscribe({
      next: () => {
        this.notification.success('Configuração profissional salva com sucesso.');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error(this.translate.instant('admin.settings.errorSaving'));
        this.saving.set(false);
      },
    });
  }

  private syncUnifiedSettings(): void {
    this.generalSettings = {
      ...this.generalSettings,
      siteName: this.settings.siteName,
      siteDescription: this.settings.siteDescription,
      logoUrl: this.settings.logoUrl,
      faviconUrl: this.settings.faviconUrl,
      maintenanceMode: this.settings.maintenanceMode,
      enableTestimonials: this.settings.allowTestimonials,
      enableShop: this.settings.allowOnlinePayment,
      enableAppointments: this.settings.allowRegistration,
    };

    this.contactSettings = {
      ...this.contactSettings,
      email: this.settings.email,
      phone: this.settings.phone,
      whatsapp: this.settings.whatsapp,
      address: this.settings.address,
      instagram: this.settings.instagramUrl,
      facebook: this.settings.facebookUrl,
      youtube: this.settings.youtubeUrl,
      tiktok: this.settings.tiktokUrl,
    };

    this.contentSettings = {
      ...this.contentSettings,
      heroTitle: this.settings.homeHeroTitle,
      heroSubtitle: this.settings.homeHeroSubtitle,
      aboutContent: this.settings.aboutText,
      servicesTitle: this.settings.servicesTitle,
      servicesSubtitle: this.settings.servicesSubtitle,
      ctaTitle: this.settings.ctaTitle,
      ctaSubtitle: this.settings.ctaSubtitle,
      ctaButtonLabel: this.settings.ctaButtonLabel,
      ctaButtonUrl: this.settings.ctaButtonUrl,
      footerText: this.settings.footerText,
      footerDisclaimer: this.settings.footerDisclaimer,
      privacyPolicy: this.settings.privacyPolicy,
      termsOfService: this.settings.termsOfService,
    };

    this.analyticsSettings = {
      ...this.analyticsSettings,
      googleAnalyticsId: this.settings.googleAnalyticsId,
      facebookPixelId: this.settings.facebookPixelId,
      hotjarId: this.settings.hotjarId,
    };
  }

  private normalizeDomainSettings(): void {
    this.professionalSettings = {
      ...this.professionalSettings,
      languages: this.parseList(this.languagesText),
      credentials: this.parseList(this.credentialsText),
    };

    const existingByName = new Map(
      this.specialties.map((specialty) => [specialty.name.toLowerCase(), specialty])
    );
    const cardModuleNames = new Set(
      this.parseList(this.cardModuleSpecialtiesText).map((name) => name.toLowerCase())
    );

    this.specialties = this.parseList(this.specialtiesText).map((name) => {
      const existing = existingByName.get(name.toLowerCase());
      const usesCardModule = cardModuleNames.has(name.toLowerCase());

      return {
        ...(existing || {
          slug: this.slugify(name),
          name,
          isActive: true,
          usesCardModule: false,
        }),
        usesCardModule,
        moduleKey: usesCardModule
          ? 'tarot-cards'
          : (existing?.moduleKey === 'tarot-cards' ? undefined : existing?.moduleKey),
      };
    });

    this.seoSettings = {
      ...this.seoSettings,
      keywords: this.parseList(this.seoKeywordsText),
    };
  }

  private parseList(value: string): string[] {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  onLogoUpload(event: FileUploadHandlerEvent) {
    // TODO: Implement file upload
    this.notification.info(this.translate.instant('admin.settings.uploadComingSoon'));
  }

  onFaviconUpload(event: FileUploadHandlerEvent) {
    // TODO: Implement file upload
    this.notification.info(this.translate.instant('admin.settings.uploadComingSoon'));
  }

  clearCache() {
    this.notification.info(this.translate.instant('admin.settings.cacheCleared'));
  }
}

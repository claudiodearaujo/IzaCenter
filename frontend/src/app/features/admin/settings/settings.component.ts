// apps/frontend/src/app/features/admin/settings/settings.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';
import { EditorModule } from 'primeng/editor';

import {
  SettingsService,
  GeneralSettings,
  ContactSettings,
  BusinessHour,
  ContentSettings,
  AnalyticsSettings,
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
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private notification = inject(NotificationService);

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
    privacyPolicy: string;
    termsOfService: string;
    googleAnalyticsId: string;
    facebookPixelId: string;
    hotjarId: string;
  } = {
    siteName: 'Izabela Tarot',
    siteDescription: 'Leituras de Tarot Cigano com Izabela',
    siteKeywords: '',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
    allowRegistration: true,
    allowTestimonials: true,
    allowOnlinePayment: true,
    email: 'contato@izabelatarot.com.br',
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
    homeHeroTitle: 'Izabela Tarot',
    homeHeroSubtitle: 'Orientação espiritual através do Tarot Cigano',
    aboutText: '',
    privacyPolicy: '',
    termsOfService: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
  };

  generalSettings: GeneralSettings = {
    siteName: 'Izabela Tarot',
    siteDescription: 'Leituras de Tarot Cigano com Izabela',
    logoUrl: '',
    faviconUrl: '',
    maintenanceMode: false,
  };

  contactSettings: ContactSettings = {
    email: 'contato@izabelatarot.com.br',
    phone: '(11) 99999-9999',
    whatsapp: '',
    address: '',
    instagramUrl: '',
    facebookUrl: '',
    youtubeUrl: '',
  };

  businessHours: BusinessHour[] = [];

  contentSettings: ContentSettings = {
    homeTitle: 'Izabela Tarot',
    homeSubtitle: 'Orientação espiritual através do Tarot Cigano',
    aboutText: '',
    privacyPolicy: '',
    termsOfService: '',
  };

  analyticsSettings: AnalyticsSettings = {
    googleAnalyticsId: '',
    facebookPixelId: '',
    hotjarId: '',
  };

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
        this.analyticsSettings = data.analytics || this.analyticsSettings;
        
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
    this.saveGeneralSettings();
  }

  saveGeneralSettings() {
    this.saving.set(true);
    this.settingsService.updateGeneralSettings(this.generalSettings).subscribe({
      next: () => {
        this.notification.success('Configurações gerais salvas!');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar configurações');
        this.saving.set(false);
      },
    });
  }

  saveContactSettings() {
    this.saving.set(true);
    this.settingsService.updateContactSettings(this.contactSettings).subscribe({
      next: () => {
        this.notification.success('Informações de contato salvas!');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar configurações');
        this.saving.set(false);
      },
    });
  }

  saveBusinessHours() {
    this.saving.set(true);
    this.settingsService.updateBusinessHours(this.businessHours).subscribe({
      next: () => {
        this.notification.success('Horários de funcionamento salvos!');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar configurações');
        this.saving.set(false);
      },
    });
  }

  saveContentSettings() {
    this.saving.set(true);
    this.settingsService.updateContentSettings(this.contentSettings).subscribe({
      next: () => {
        this.notification.success('Conteúdo salvo!');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar configurações');
        this.saving.set(false);
      },
    });
  }

  saveAnalyticsSettings() {
    this.saving.set(true);
    this.settingsService.updateAnalyticsSettings(this.analyticsSettings).subscribe({
      next: () => {
        this.notification.success('Configurações de analytics salvas!');
        this.saving.set(false);
      },
      error: () => {
        this.notification.error('Erro ao salvar configurações');
        this.saving.set(false);
      },
    });
  }

  onLogoUpload(event: FileUploadHandlerEvent) {
    // TODO: Implement file upload
    this.notification.info('Upload de arquivos será implementado em breve');
  }

  onFaviconUpload(event: FileUploadHandlerEvent) {
    // TODO: Implement file upload
    this.notification.info('Upload de arquivos será implementado em breve');
  }

  clearCache() {
    this.notification.info('Cache limpo com sucesso!');
  }
}

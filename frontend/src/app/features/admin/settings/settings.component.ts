// apps/frontend/src/app/features/admin/settings/settings.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { Tabs, TabsModule } from 'primeng/tabs';
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
    TabsModule,
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
}

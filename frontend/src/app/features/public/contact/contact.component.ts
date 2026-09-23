import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { ApiService } from '../../../core/services/api.service';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);
  private api = inject(ApiService);
  private publicSettingsStore = inject(PublicSettingsStore);

  isLoading = signal(false);
  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);

  contactInfo = computed(() => {
    const settings = this.publicSettings();
    const items = [
      settings.contact.email ? { icon: 'pi-envelope', label: this.translate.instant('contact.info.email.label'), value: settings.contact.email } : null,
      settings.contact.phone ? { icon: 'pi-phone', label: 'Telefone', value: settings.contact.phone } : null,
      settings.contact.whatsapp ? { icon: 'pi-whatsapp', label: 'WhatsApp', value: settings.contact.whatsapp } : null,
      (settings.professional.location || settings.contact.address)
        ? { icon: 'pi-map-marker', label: this.translate.instant('contact.info.location.label'), value: settings.professional.location || settings.contact.address || '' }
        : null,
    ];
    return items.filter((item): item is NonNullable<typeof item> => !!item);
  });

  socialLinks = computed(() => {
    const contact = this.publicSettings().contact;
    return [
      contact.instagram ? { icon: 'pi-instagram', url: contact.instagram, label: 'Instagram' } : null,
      contact.facebook ? { icon: 'pi-facebook', url: contact.facebook, label: 'Facebook' } : null,
      contact.youtube ? { icon: 'pi-youtube', url: contact.youtube, label: 'YouTube' } : null,
      contact.tiktok ? { icon: 'pi-video', url: contact.tiktok, label: 'TikTok' } : null,
      contact.whatsapp ? { icon: 'pi-whatsapp', url: this.toWhatsappUrl(contact.whatsapp), label: 'WhatsApp' } : null,
    ].filter((item): item is NonNullable<typeof item> => !!item);
  });

  form = { name: '', email: '', subject: '', message: '' };

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.publicSettings.set(settings);
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: 'Contato',
        description: 'Entre em contato com ' + settings.professional.displayName + ' para tirar dúvidas sobre serviços e atendimentos.',
        keywords: settings.seo.keywords.join(', '),
        url: window.location.origin + '/contato'
      });
      this.seoService.setSchema(this.seoService.getBreadcrumbSchema([
        { name: 'Início', url: '/' },
        { name: 'Contato', url: '/contato' }
      ]));
    });
  }

  onSubmit(): void {
    this.isLoading.set(true);
    this.api.post<{ message: string }>('/contact', this.form).subscribe({
      next: () => {
        this.notificationService.showSuccess(this.translate.instant('contact.form.successMessage'));
        this.form = { name: '', email: '', subject: '', message: '' };
        this.isLoading.set(false);
      },
      error: (err) => {
        this.notificationService.showError(err.error?.message || this.translate.instant('contact.form.errorMessage'));
        this.isLoading.set(false);
      },
    });
  }

  private toWhatsappUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) return value;
    return 'https://wa.me/' + value.replace(/\D/g, '');
  }
}

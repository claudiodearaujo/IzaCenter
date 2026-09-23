import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  private publicSettingsStore = inject(PublicSettingsStore);

  currentYear = new Date().getFullYear();
  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);

  socialLinks = computed(() => {
    const contact = this.publicSettings().contact;
    const links = [
      contact.instagram ? { icon: 'pi-instagram', url: contact.instagram, label: 'Instagram' } : null,
      contact.facebook ? { icon: 'pi-facebook', url: contact.facebook, label: 'Facebook' } : null,
      contact.youtube ? { icon: 'pi-youtube', url: contact.youtube, label: 'YouTube' } : null,
      contact.tiktok ? { icon: 'pi-video', url: contact.tiktok, label: 'TikTok' } : null,
      contact.whatsapp ? { icon: 'pi-whatsapp', url: this.toWhatsappUrl(contact.whatsapp), label: 'WhatsApp' } : null,
      contact.email ? { icon: 'pi-envelope', url: `mailto:${contact.email}`, label: 'Email' } : null,
    ];
    return links.filter((link): link is NonNullable<typeof link> => !!link);
  });

  quickLinks = [
    { labelKey: 'nav.home', route: '/' },
    { labelKey: 'nav.about', route: '/sobre' },
    { labelKey: 'nav.services', route: '/servicos' },
    { labelKey: 'nav.shop', route: '/loja', feature: 'shop' },
    { labelKey: 'nav.contact', route: '/contato' },
  ];

  legalLinks = [
    { labelKey: 'footer.termsOfUse', route: '/termos-de-uso' },
    { labelKey: 'footer.privacyPolicy', route: '/politica-de-privacidade' },
    { labelKey: 'footer.faq', route: '/faq' }
  ];

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => this.publicSettings.set(settings));
  }

  shouldShowLink(link: { feature?: string }): boolean {
    if (link.feature === 'shop') return this.publicSettings().enableShop;
    return true;
  }

  get openHoursText(): string | null {
    const openDays = this.publicSettings().businessHours.filter((day) => day.isOpen && day.start && day.end);
    if (!openDays.length) return null;
    const first = openDays[0];
    return `${first.dayName}: ${first.start} - ${first.end}`;
  }

  private toWhatsappUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) return value;
    return `https://wa.me/${value.replace(/\D/g, '')}`;
  }
}

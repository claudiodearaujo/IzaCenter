import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BrandingSettings } from './settings.service';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  apply(branding: BrandingSettings): void {
    const root = this.document.documentElement;

    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);
    root.style.setProperty('--brand-accent', branding.accentColor);
    root.style.setProperty('--brand-surface', branding.surfaceColor);
    root.style.setProperty('--brand-text', branding.textColor);
    root.style.setProperty('--brand-font-family', branding.fontFamily);
    root.style.setProperty('--brand-radius', branding.borderRadius);

    if (branding.faviconUrl) {
      let link = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!link) {
        link = this.document.createElement('link');
        link.rel = 'icon';
        this.document.head.appendChild(link);
      }
      link.href = branding.faviconUrl;
    }
  }
}

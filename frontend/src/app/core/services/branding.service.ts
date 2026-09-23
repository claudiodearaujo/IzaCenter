import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { BrandingSettings } from './settings.service';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  constructor(@Inject(DOCUMENT) private document: Document) {}

  apply(branding: BrandingSettings): void {
    const root = this.document.documentElement;
    const primary = this.palette(branding.primaryColor);
    const secondary = this.palette(branding.secondaryColor);

    for (const [tone, color] of Object.entries(primary)) {
      root.style.setProperty(`--primary-${tone}`, color);
      root.style.setProperty(`--color-primary-${tone}`, color);
    }

    for (const [tone, color] of Object.entries(secondary)) {
      root.style.setProperty(`--secondary-${tone}`, color);
      root.style.setProperty(`--color-secondary-${tone}`, color);
    }

    root.style.setProperty('--primary', primary['600']);
    root.style.setProperty('--secondary', secondary['700']);
    root.style.setProperty('--accent', branding.accentColor);
    root.style.setProperty('--brand-primary', branding.primaryColor);
    root.style.setProperty('--brand-secondary', branding.secondaryColor);
    root.style.setProperty('--brand-accent', branding.accentColor);
    root.style.setProperty('--brand-surface', branding.surfaceColor);
    root.style.setProperty('--brand-text', branding.textColor);
    root.style.setProperty('--brand-font-family', branding.fontFamily);
    root.style.setProperty('--brand-radius', branding.borderRadius);

    if (this.document.body) {
      this.document.body.style.fontFamily = branding.fontFamily;
      this.document.body.style.backgroundColor = branding.surfaceColor;
      this.document.body.style.color = branding.textColor;
    }

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

  private palette(color: string): Record<string, string> {
    return {
      '50': this.mix(color, '#ffffff', 0.92),
      '100': this.mix(color, '#ffffff', 0.82),
      '200': this.mix(color, '#ffffff', 0.65),
      '300': this.mix(color, '#ffffff', 0.45),
      '400': this.mix(color, '#ffffff', 0.22),
      '500': color,
      '600': this.mix(color, '#000000', 0.12),
      '700': this.mix(color, '#000000', 0.24),
      '800': this.mix(color, '#000000', 0.36),
      '900': this.mix(color, '#000000', 0.48),
    };
  }

  private mix(color: string, target: string, weight: number): string {
    const sourceRgb = this.hexToRgb(color);
    const targetRgb = this.hexToRgb(target);
    const channel = (source: number, destination: number) =>
      Math.round(source * (1 - weight) + destination * weight);

    return `#${[channel(sourceRgb.r, targetRgb.r), channel(sourceRgb.g, targetRgb.g), channel(sourceRgb.b, targetRgb.b)]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const normalized = hex.replace('#', '');
    return {
      r: parseInt(normalized.slice(0, 2), 16),
      g: parseInt(normalized.slice(2, 4), 16),
      b: parseInt(normalized.slice(4, 6), 16),
    };
  }
}

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);
  private publicSettingsStore = inject(PublicSettingsStore);

  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.publicSettings.set(settings);
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: 'Sobre ' + settings.professional.displayName,
        description: settings.professional.bio || settings.siteDescription,
        keywords: settings.seo.keywords.join(', '),
        image: settings.professional.photoUrl || settings.logoUrl,
        url: window.location.origin + '/sobre',
      });
      this.seoService.setSchema([
        this.seoService.getPersonSchema(),
        this.seoService.getBreadcrumbSchema([
          { name: 'Início', url: '/' },
          { name: 'Sobre', url: '/sobre' },
        ]),
      ]);
    });
  }
}

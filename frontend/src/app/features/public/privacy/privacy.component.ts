import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent implements OnInit {
  private seoService = inject(SeoService);
  private publicSettingsStore = inject(PublicSettingsStore);

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: 'Política de Privacidade',
        description: 'Política de Privacidade de ' + settings.siteName + ' e informações sobre proteção de dados pessoais conforme a LGPD.',
        keywords: settings.seo.keywords.join(', '),
        url: window.location.origin + '/politica-de-privacidade'
      });
    });
  }
}

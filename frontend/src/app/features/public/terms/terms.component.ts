import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';
import { PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent implements OnInit {
  private seoService = inject(SeoService);
  private publicSettingsStore = inject(PublicSettingsStore);

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: 'Termos de Uso',
        description: 'Termos e condições para utilização dos serviços oferecidos por ' + settings.siteName + '.',
        keywords: settings.seo.keywords.join(', '),
        url: window.location.origin + '/termos-de-uso'
      });
    });
  }
}

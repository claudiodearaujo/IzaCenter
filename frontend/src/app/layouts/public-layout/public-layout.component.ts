import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { CookieConsentComponent } from '../../shared/components/cookie-consent/cookie-consent.component';
import { PublicSettingsStore } from '../../core/services/public-settings.store';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    ToastModule,
    HeaderComponent,
    FooterComponent,
    CookieConsentComponent
  ],
  providers: [MessageService],
  templateUrl: './public-layout.component.html',
  styleUrl: './public-layout.component.css'
})
export class PublicLayoutComponent implements OnInit {
  private publicSettings = inject(PublicSettingsStore);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.publicSettings.load().subscribe((settings) => {
      this.seoService.configure(settings);
    });
  }
}

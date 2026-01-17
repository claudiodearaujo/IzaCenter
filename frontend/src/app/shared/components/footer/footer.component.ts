import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  socialLinks = [
    { icon: 'pi-instagram', url: 'https://instagram.com/izabela.tarot', label: 'Instagram' },
    { icon: 'pi-whatsapp', url: 'https://wa.me/5531999999999', label: 'WhatsApp' },
    { icon: 'pi-envelope', url: 'mailto:izabela.ayurvida@gmail.com', label: 'Email' }
  ];

  quickLinks = [
    { labelKey: 'nav.home', route: '/' },
    { labelKey: 'nav.about', route: '/sobre' },
    { labelKey: 'nav.services', route: '/servicos' },
    { labelKey: 'nav.shop', route: '/loja' },
    { labelKey: 'nav.contact', route: '/contato' },
    { labelKey: 'footer.admin', route: '/admin' }
  ];

  legalLinks = [
    { labelKey: 'footer.termsOfUse', route: '/termos' },
    { labelKey: 'footer.privacyPolicy', route: '/privacidade' },
    { labelKey: 'footer.faq', route: '/faq' }
  ];
}

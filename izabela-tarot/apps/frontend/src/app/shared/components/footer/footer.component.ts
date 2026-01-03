import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
    { label: 'Início', route: '/' },
    { label: 'Sobre', route: '/sobre' },
    { label: 'Serviços', route: '/servicos' },
    { label: 'Loja', route: '/loja' },
    { label: 'Contato', route: '/contato' }
  ];

  legalLinks = [
    { label: 'Termos de Uso', route: '/termos' },
    { label: 'Política de Privacidade', route: '/privacidade' },
    { label: 'FAQ', route: '/faq' }
  ];
}

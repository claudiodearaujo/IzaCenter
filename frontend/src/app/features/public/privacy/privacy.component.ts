import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css'
})
export class PrivacyComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Política de Privacidade',
      description: 'Política de Privacidade da plataforma IzaCenter — saiba como coletamos, usamos e protegemos seus dados pessoais conforme a LGPD.',
      url: 'https://www.izabelatarot.com.br/politica-de-privacidade'
    });
  }
}

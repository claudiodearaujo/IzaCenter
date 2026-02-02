import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TranslateModule],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit {
  private readonly seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Sobre Izabela Santos',
      description: 'Conheça Izabela Santos, taróloga e estudante de Psicologia Analítica Junguiana, com formação em Administração de Empresas e Terapias Integrativas Naturais.',
      url: 'https://www.izabelatarot.com.br/sobre'
    });

    this.seoService.setSchema([
      this.seoService.getPersonSchema(),
      this.seoService.getBreadcrumbSchema([
        { name: 'Início', url: '/' },
        { name: 'Sobre', url: '/sobre' }
      ])
    ]);
  }
}

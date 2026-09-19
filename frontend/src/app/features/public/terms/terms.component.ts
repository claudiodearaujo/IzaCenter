import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './terms.component.html',
  styleUrl: './terms.component.css'
})
export class TermsComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Termos de Uso',
      description: 'Termos de Uso da plataforma Therapist Platform — leia os termos e condições para utilização dos nossos serviços.',
      url: 'https://www.example.com/termos-de-uso'
    });
  }
}

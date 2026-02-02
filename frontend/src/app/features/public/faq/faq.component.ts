import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule, TranslateModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit {
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Perguntas Frequentes',
      description: 'Encontre respostas para as dúvidas mais comuns sobre leituras de tarot e baralho cigano com Izabela Santos.',
      url: 'https://www.izabelatarot.com.br/faq'
    });

    // Set FAQ schema after translations are loaded
    this.seoService.setSchema([
      this.seoService.getFaqPageSchema(this.faqs),
      this.seoService.getBreadcrumbSchema([
        { name: 'Início', url: '/' },
        { name: 'FAQ', url: '/faq' }
      ])
    ]);
  }

  get faqs() {
    return [
      {
        question: this.translate.instant('faq.items.therapeuticTarot.question'),
        answer: this.translate.instant('faq.items.therapeuticTarot.answer')
      },
      {
        question: this.translate.instant('faq.items.readingByQuestions.question'),
        answer: this.translate.instant('faq.items.readingByQuestions.answer')
      },
      {
        question: this.translate.instant('faq.items.experience.question'),
        answer: this.translate.instant('faq.items.experience.answer')
      },
      {
        question: this.translate.instant('faq.items.recording.question'),
        answer: this.translate.instant('faq.items.recording.answer')
      },
      {
        question: this.translate.instant('faq.items.validity.question'),
        answer: this.translate.instant('faq.items.validity.answer')
      },
      {
        question: this.translate.instant('faq.items.topics.question'),
        answer: this.translate.instant('faq.items.topics.answer')
      }
    ];
  }
}

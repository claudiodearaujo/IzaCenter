import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule, TranslateModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  private translate = inject(TranslateService);

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

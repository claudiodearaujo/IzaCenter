import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TestimonialCardComponent, TranslateModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent {
  private translate = inject(TranslateService);

  get testimonials(): Testimonial[] {
    return [
      {
        id: '1',
        clientName: 'Maria Silva',
        content: this.translate.instant('testimonials.items.item1'),
        rating: 5
      },
      {
        id: '2',
        clientName: 'Ana Paula',
        content: this.translate.instant('testimonials.items.item2'),
        rating: 5
      },
      {
        id: '3',
        clientName: 'Juliana Costa',
        content: this.translate.instant('testimonials.items.item3'),
        rating: 5
      },
      {
        id: '4',
        clientName: 'Fernanda Lima',
        content: this.translate.instant('testimonials.items.item4'),
        rating: 5
      },
      {
        id: '5',
        clientName: 'Carla Mendes',
        content: this.translate.instant('testimonials.items.item5'),
        rating: 5
      },
      {
        id: '6',
        clientName: 'Patricia Santos',
        content: this.translate.instant('testimonials.items.item6'),
        rating: 5
      }
    ];
  }
}

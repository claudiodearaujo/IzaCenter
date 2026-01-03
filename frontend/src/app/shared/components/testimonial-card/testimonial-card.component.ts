import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Testimonial {
  id: string;
  clientName: string;
  clientAvatarUrl?: string;
  content: string;
  rating?: number;
}

@Component({
  selector: 'app-testimonial-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './testimonial-card.component.html',
  styleUrl: './testimonial-card.component.css'
})
export class TestimonialCardComponent {
  @Input({ required: true }) testimonial!: Testimonial;

  get stars(): number[] {
    return Array(this.testimonial.rating || 5).fill(0);
  }

  get initials(): string {
    return this.testimonial.clientName
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}

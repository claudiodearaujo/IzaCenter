import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialCardComponent } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';
import { TestimonialsService, Testimonial } from '../../../core/services/testimonials.service';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TestimonialCardComponent, TranslateModule, SkeletonModule],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent implements OnInit {
  private testimonialsService = inject(TestimonialsService);

  testimonials = signal<Testimonial[]>([]);
  loading = signal(true);
  error = signal(false);

  ngOnInit(): void {
    this.testimonialsService.findPublic().subscribe({
      next: (response) => {
        this.testimonials.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}

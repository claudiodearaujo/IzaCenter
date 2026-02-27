import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fadeInUp, listAnimation } from '../../../shared/animations/fade.animation';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SeoService } from '../../../core/services/seo.service';
import { TestimonialsService } from '../../../core/services/testimonials.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CarouselModule,
    SkeletonModule,
    TranslateModule,
    TestimonialCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [fadeInUp, listAnimation]
})
export class HomeComponent implements OnInit {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);
  private seoService = inject(SeoService);
  private translate = inject(TranslateService);
  private testimonialsService = inject(TestimonialsService);

  featuredProducts = signal<Product[]>([]);
  testimonials = signal<Testimonial[]>([]);
  loadingTestimonials = signal(true);

  services = [
    {
      icon: 'assets/images/service-questions.svg',
      titleKey: 'home.services.readingByQuestions.title',
      descriptionKey: 'home.services.readingByQuestions.description',
      link: '/loja'
    },
    {
      icon: 'assets/images/service-live.svg',
      titleKey: 'home.services.liveSession.title',
      descriptionKey: 'home.services.liveSession.description',
      link: '/loja'
    },
    {
      icon: 'assets/images/service-monthly.svg',
      titleKey: 'home.services.monthlyReading.title',
      descriptionKey: 'home.services.monthlyReading.description',
      link: '/loja'
    }
  ];

  ngOnInit(): void {
    // SEO Configuration
    this.seoService.setMeta({
      title: 'Leituras de Tarot e Baralho Cigano',
      description: 'Leituras de tarot e baralho cigano Lenormand com Izabela Santos. Orientação para vida profissional, saúde e relacionamentos.',
      url: 'https://www.izabelatarot.com.br/'
    });

    this.seoService.setSchema([
      this.seoService.getOrganizationSchema(),
      this.seoService.getWebSiteSchema()
    ]);

    // Sprint 2.3 — Depoimentos dinâmicos via API
    this.loadTestimonials();
  }

  private loadTestimonials(): void {
    this.loadingTestimonials.set(true);

    this.testimonialsService.findFeatured(3).subscribe({
      next: (response) => {
        this.testimonials.set(
          response.data.map(t => ({
            id: t.id,
            clientName: t.clientName,
            clientAvatarUrl: t.clientAvatarUrl,
            content: t.content,
            rating: t.rating,
          }))
        );
        this.loadingTestimonials.set(false);
      },
      error: () => {
        // Falha silenciosa — seção simplesmente não exibe depoimentos
        this.testimonials.set([]);
        this.loadingTestimonials.set(false);
      },
    });
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.notificationService.showSuccess(this.translate.instant('cart.productAdded'));
  }
}

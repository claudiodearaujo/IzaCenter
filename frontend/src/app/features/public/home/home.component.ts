import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { fadeInUp, listAnimation } from '../../../shared/animations/fade.animation';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CarouselModule,
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

  featuredProducts = signal<Product[]>([]);
  testimonials = signal<Testimonial[]>([]);

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

    // Load data
    this.loadMockData();
  }

  private loadMockData(): void {
    this.testimonials.set([
      {
        id: '1',
        clientName: 'Maria Silva',
        content: 'A leitura da Izabela foi transformadora. Me ajudou a entender melhor meu momento profissional.',
        rating: 5
      },
      {
        id: '2',
        clientName: 'Ana Paula',
        content: 'Clareza e acolhimento em cada palavra. Recomendo demais!',
        rating: 5
      },
      {
        id: '3',
        clientName: 'Juliana Costa',
        content: 'Encontrei orientação e paz. A Izabela tem um dom especial.',
        rating: 5
      }
    ]);
  }

  addToCart(product: Product): void {
    this.cartService.addItem(product);
    this.notificationService.showSuccess(this.translate.instant('cart.productAdded'));
  }
}

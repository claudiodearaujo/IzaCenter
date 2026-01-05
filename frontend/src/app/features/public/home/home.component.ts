import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { fadeInUp, listAnimation } from '../../../shared/animations/fade.animation';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';
import { Product } from '../../../core/models/product.model';
import { CartService } from '../../../core/services/cart.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CarouselModule,

    TestimonialCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  animations: [fadeInUp, listAnimation]
})
export class HomeComponent implements OnInit {
  private cartService = inject(CartService);
  private notificationService = inject(NotificationService);

  featuredProducts = signal<Product[]>([]);
  testimonials = signal<Testimonial[]>([]);

  services = [
    {
      icon: 'assets/images/service-questions.svg',
      title: 'Leitura por Perguntas',
      description: 'Respostas claras e objetivas para suas questões mais importantes.',
      link: '/loja'
    },
    {
      icon: 'assets/images/service-live.svg',
      title: 'Sessão Online ao Vivo',
      description: 'Consulta personalizada por videochamada com orientação em tempo real.',
      link: '/loja'
    },
    {
      icon: 'assets/images/service-monthly.svg',
      title: 'Jogo Mensal',
      description: 'Acompanhamento mensal com previsões e orientações para o mês.',
      link: '/loja'
    }
  ];

  ngOnInit(): void {
    // TODO: Load from API
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
    this.notificationService.showSuccess('Produto adicionado ao carrinho!');
  }
}

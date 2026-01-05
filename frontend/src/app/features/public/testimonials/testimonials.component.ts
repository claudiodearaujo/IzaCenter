import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestimonialCardComponent, Testimonial } from '../../../shared/components/testimonial-card/testimonial-card.component';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, TestimonialCardComponent],
  templateUrl: './testimonials.component.html',
  styleUrl: './testimonials.component.css'
})
export class TestimonialsComponent {
  testimonials = signal<Testimonial[]>([
    { id: '1', clientName: 'Maria Silva', content: 'A leitura da Izabela foi transformadora. Me ajudou a entender melhor meu momento profissional e tomar decisões importantes.', rating: 5 },
    { id: '2', clientName: 'Ana Paula', content: 'Clareza e acolhimento em cada palavra. Recomendo demais para quem busca orientação verdadeira.', rating: 5 },
    { id: '3', clientName: 'Juliana Costa', content: 'Encontrei orientação e paz. A Izabela tem um dom especial para interpretar as cartas.', rating: 5 },
    { id: '4', clientName: 'Fernanda Lima', content: 'Fiz minha primeira leitura e fiquei impressionada com a precisão. Voltarei com certeza!', rating: 5 },
    { id: '5', clientName: 'Carla Mendes', content: 'A sessão online foi incrível. Me senti muito acolhida e recebi orientações valiosas.', rating: 5 },
    { id: '6', clientName: 'Patricia Santos', content: 'O jogo mensal me ajuda a planejar meu mês com mais consciência. Super recomendo!', rating: 5 }
  ]);
}

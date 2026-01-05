import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent {
  faqs = signal([
    { question: 'O que é o tarot terapêutico?', answer: 'O tarot terapêutico é uma ferramenta de autoconhecimento que utiliza as cartas para reflexão e orientação, não como previsão do futuro, mas como um espelho para compreender melhor situações e possibilidades.' },
    { question: 'Como funciona a leitura por perguntas?', answer: 'Você envia suas perguntas através da plataforma. Eu faço a tiragem das cartas e preparo uma interpretação detalhada em PDF, que fica disponível na sua área de cliente em até 48h.' },
    { question: 'Preciso de experiência com tarot?', answer: 'Não! As leituras são feitas de forma clara e acessível. Você não precisa ter nenhum conhecimento prévio sobre tarot ou o baralho cigano.' },
    { question: 'As sessões online são gravadas?', answer: 'Sim, com sua autorização, as sessões online podem ser gravadas para que você possa revisar as orientações depois.' },
    { question: 'Qual a validade da leitura?', answer: 'As leituras ficam disponíveis na sua área de cliente por 1 ano após a publicação.' },
    { question: 'Posso fazer perguntas sobre qualquer assunto?', answer: 'As leituras podem abordar áreas como profissional, relacionamentos, saúde emocional e crescimento pessoal. Evitamos questões sobre saúde física, assuntos legais ou terceiros.' }
  ]);
}

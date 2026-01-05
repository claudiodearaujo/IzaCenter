import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {
  services = [
    {
      icon: '🔮',
      title: 'Leitura por Perguntas',
      description: 'Faça suas perguntas e receba orientação através das cartas. Ideal para dúvidas específicas.',
      features: ['1, 3 ou 5 perguntas', 'Resposta em até 48h', 'Leitura detalhada em PDF', 'Validade de 1 ano'],
      price: 'A partir de R$ 50,00'
    },
    {
      icon: '✨',
      title: 'Sessão Online ao Vivo',
      description: 'Consulta personalizada por videochamada. Interação em tempo real e tiragem exclusiva.',
      features: ['30 ou 60 minutos', 'Videochamada ao vivo', 'Perguntas ilimitadas', 'Gravação da sessão'],
      price: 'A partir de R$ 150,00'
    },
    {
      icon: '📿',
      title: 'Jogo Mensal',
      description: 'Acompanhamento mensal com previsões e orientações para cada área da sua vida.',
      features: ['Previsão completa do mês', 'Todas as áreas da vida', 'Áudio explicativo', 'Atualização mensal'],
      price: 'R$ 120,00/mês'
    },
    {
      icon: '🌟',
      title: 'Jogo Especial',
      description: 'Leituras temáticas para momentos especiais: aniversário, ano novo, lua cheia.',
      features: ['Tiragens especiais', 'Ritual personalizado', 'PDF ilustrado', 'Presente especial'],
      price: 'A partir de R$ 100,00'
    }
  ];
}

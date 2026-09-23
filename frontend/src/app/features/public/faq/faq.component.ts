import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion';
import { SeoService } from '../../../core/services/seo.service';
import { DEFAULT_PUBLIC_SETTINGS, PublicSettingsStore } from '../../../core/services/public-settings.store';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, AccordionModule],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.css'
})
export class FaqComponent implements OnInit {
  private seoService = inject(SeoService);
  private publicSettingsStore = inject(PublicSettingsStore);

  publicSettings = signal(DEFAULT_PUBLIC_SETTINGS);

  faqs = computed(() => [
    {
      question: 'Como escolher o serviço mais adequado?',
      answer: 'Consulte a descrição, o formato e as capacidades de cada serviço. Se ainda tiver dúvida, use a página de contato para falar com ' + this.publicSettings().professional.displayName + '.'
    },
    {
      question: 'Como funciona o agendamento?',
      answer: 'Serviços que exigem horário exibem essa informação no catálogo. Após a contratação, o fluxo de agendamento fica disponível conforme as regras do serviço.'
    },
    {
      question: 'O que é uma entrega digital?',
      answer: 'Alguns serviços incluem materiais digitais como texto, PDF, áudio, vídeo ou uma combinação desses formatos. Quando houver entrega, ela ficará disponível na sua área de cliente.'
    },
    {
      question: 'Como acompanho meus pedidos e entregas?',
      answer: 'Na área de cliente você pode consultar pedidos, agendamentos e entregas digitais vinculadas aos serviços contratados.'
    },
    {
      question: 'Por quanto tempo uma entrega fica disponível?',
      answer: 'O prazo de acesso é definido em cada serviço. Consulte os detalhes do item contratado para verificar sua validade.'
    },
    {
      question: 'Os serviços substituem atendimento profissional regulamentado?',
      answer: 'Não. Quando aplicável, conteúdos e serviços da plataforma não substituem orientação médica, psicológica, jurídica, financeira ou de outro profissional regulamentado.'
    }
  ]);

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.publicSettings.set(settings);
      this.seoService.configure(settings);
      this.seoService.setMeta({
        title: 'Perguntas Frequentes',
        description: 'Respostas sobre serviços, agendamentos, pedidos e entregas de ' + settings.siteName + '.',
        keywords: settings.seo.keywords.join(', '),
        url: window.location.origin + '/faq'
      });
      this.seoService.setSchema([
        this.seoService.getFaqPageSchema(this.faqs()),
        this.seoService.getBreadcrumbSchema([{ name: 'Início', url: '/' }, { name: 'FAQ', url: '/faq' }])
      ]);
    });
  }
}

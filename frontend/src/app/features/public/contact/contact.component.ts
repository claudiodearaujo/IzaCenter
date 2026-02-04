import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private translate = inject(TranslateService);
  private seoService = inject(SeoService);

  isLoading = signal(false);

  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  ngOnInit(): void {
    this.seoService.setMeta({
      title: 'Contato',
      description: 'Entre em contato com Izabela Santos para agendar sua leitura de tarot ou tirar dúvidas sobre os serviços.',
      url: 'https://www.izabelatarot.com.br/contato'
    });

    this.seoService.setSchema(
      this.seoService.getBreadcrumbSchema([
        { name: 'Início', url: '/' },
        { name: 'Contato', url: '/contato' }
      ])
    );
  }

  get contactInfo() {
    return [
      { icon: 'pi-envelope', label: this.translate.instant('contact.info.email.label'), value: this.translate.instant('contact.info.email.value') },
      { icon: 'pi-instagram', label: this.translate.instant('contact.info.instagram.label'), value: this.translate.instant('contact.info.instagram.value') },
      { icon: 'pi-clock', label: this.translate.instant('contact.info.schedule.label'), value: this.translate.instant('contact.info.schedule.value') },
      { icon: 'pi-map-marker', label: this.translate.instant('contact.info.location.label'), value: this.translate.instant('contact.info.location.value') }
    ];
  }

  async onSubmit(): Promise<void> {
    this.isLoading.set(true);

    // TODO: Send to API
    await new Promise(resolve => setTimeout(resolve, 1000));

    this.notificationService.showSuccess(this.translate.instant('contact.form.successMessage'));
    this.form = { name: '', email: '', subject: '', message: '' };
    this.isLoading.set(false);
  }
}

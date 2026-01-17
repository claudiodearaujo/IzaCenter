import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../core/services/notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, TranslateModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private notificationService = inject(NotificationService);
  private translate = inject(TranslateService);

  isLoading = signal(false);

  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  get contactInfo() {
    return [
      { icon: 'pi-envelope', label: this.translate.instant('contact.info.email.label'), value: 'izabela.ayurvida@gmail.com' },
      { icon: 'pi-instagram', label: this.translate.instant('contact.info.instagram.label'), value: '@izabela.tarot' },
      { icon: 'pi-clock', label: this.translate.instant('contact.info.schedule.label'), value: this.translate.instant('contact.info.schedule.value') },
      { icon: 'pi-map-marker', label: this.translate.instant('contact.info.location.label'), value: 'Belo Horizonte, MG' }
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

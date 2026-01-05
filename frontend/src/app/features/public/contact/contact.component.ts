import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css'
})
export class ContactComponent {
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  
  form = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  contactInfo = [
    { icon: 'pi-envelope', label: 'Email', value: 'izabela.ayurvida@gmail.com' },
    { icon: 'pi-instagram', label: 'Instagram', value: '@izabela.tarot' },
    { icon: 'pi-clock', label: 'Horário', value: 'Seg - Sex: 9h às 18h' },
    { icon: 'pi-map-marker', label: 'Localização', value: 'Belo Horizonte, MG' }
  ];

  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    
    // TODO: Send to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.notificationService.showSuccess('Mensagem enviada com sucesso! Retornarei em breve.');
    this.form = { name: '', email: '', subject: '', message: '' };
    this.isLoading.set(false);
  }
}

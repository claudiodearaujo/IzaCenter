import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);

  showSuccess(message: string, title: string = 'Sucesso'): void {
    this.messageService.add({
      severity: 'success',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  showError(message: string, title: string = 'Erro'): void {
    this.messageService.add({
      severity: 'error',
      summary: title,
      detail: message,
      life: 5000
    });
  }

  showWarning(message: string, title: string = 'Atenção'): void {
    this.messageService.add({
      severity: 'warn',
      summary: title,
      detail: message,
      life: 4000
    });
  }

  showInfo(message: string, title: string = 'Informação'): void {
    this.messageService.add({
      severity: 'info',
      summary: title,
      detail: message,
      life: 3000
    });
  }

  // Aliases for convenience
  success(message: string, title?: string): void {
    this.showSuccess(message, title);
  }

  error(message: string, title?: string): void {
    this.showError(message, title);
  }

  warning(message: string, title?: string): void {
    this.showWarning(message, title);
  }

  info(message: string, title?: string): void {
    this.showInfo(message, title);
  }

  clear(): void {
    this.messageService.clear();
  }
}

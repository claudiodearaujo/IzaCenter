import { Injectable, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private messageService = inject(MessageService);
  private translateService = inject(TranslateService);

  showSuccess(message: string, title?: string): void {
    const finalTitle = title || this.translateService.instant('notifications.success');
    this.messageService.add({
      severity: 'success',
      summary: finalTitle,
      detail: message,
      life: 3000
    });
  }

  showError(message: string, title?: string): void {
    const finalTitle = title || this.translateService.instant('notifications.error');
    this.messageService.add({
      severity: 'error',
      summary: finalTitle,
      detail: message,
      life: 5000
    });
  }

  showWarning(message: string, title?: string): void {
    const finalTitle = title || this.translateService.instant('notifications.warning');
    this.messageService.add({
      severity: 'warn',
      summary: finalTitle,
      detail: message,
      life: 4000
    });
  }

  showInfo(message: string, title?: string): void {
    const finalTitle = title || this.translateService.instant('notifications.info');
    this.messageService.add({
      severity: 'info',
      summary: finalTitle,
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

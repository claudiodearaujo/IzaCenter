import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../core/services/notification.service';
import {
  PrivacyContact,
  PrivacyRequest,
  PrivacyRequestType,
  PrivacyService,
} from '../../../core/services/privacy.service';
import {
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsFormFieldComponent,
  DsPageHeaderComponent,
} from '../../../shared/design-system';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-client-privacy',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsFormFieldComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './privacy.component.html',
  styleUrl: './privacy.component.css',
})
export class ClientPrivacyComponent implements OnInit {
  private privacy = inject(PrivacyService);
  private notification = inject(NotificationService);

  requests = signal<PrivacyRequest[]>([]);
  contact = signal<PrivacyContact | null>(null);
  loading = signal(true);
  submitting = signal(false);
  exporting = signal(false);

  requestType: PrivacyRequestType = 'ACCESS';
  details = '';

  readonly requestTypes: Array<{ value: PrivacyRequestType; label: string }> = [
    { value: 'ACCESS', label: 'Acesso aos meus dados' },
    { value: 'CONFIRMATION', label: 'Confirmação de tratamento' },
    { value: 'CORRECTION', label: 'Correção de dados' },
    { value: 'PORTABILITY', label: 'Portabilidade' },
    { value: 'ANONYMIZATION', label: 'Anonimização' },
    { value: 'DELETION', label: 'Eliminação de dados' },
    { value: 'INFORMATION', label: 'Informações sobre o tratamento' },
    { value: 'CONSENT_WITHDRAWAL', label: 'Revogação de consentimento' },
  ];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    let pending = 2;
    const done = () => {
      pending -= 1;
      if (pending === 0) this.loading.set(false);
    };

    this.privacy.myRequests().subscribe({
      next: (response) => {
        this.requests.set(response.data);
        done();
      },
      error: () => {
        this.notification.showError('Não foi possível carregar suas solicitações.');
        done();
      },
    });

    this.privacy.contact().subscribe({
      next: (response) => {
        this.contact.set(response.data);
        done();
      },
      error: () => done(),
    });
  }

  createRequest(): void {
    this.submitting.set(true);
    this.privacy.createRequest(this.requestType, this.details.trim() || undefined).subscribe({
      next: () => {
        this.notification.showSuccess('Solicitação registrada com sucesso.');
        this.details = '';
        this.submitting.set(false);
        this.load();
      },
      error: (error) => {
        this.submitting.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível registrar a solicitação.'
        );
      },
    });
  }

  exportData(): void {
    this.exporting.set(true);
    this.privacy.exportData().subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `meus-dados-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.exporting.set(false);
        this.notification.showSuccess('Exportação gerada.');
      },
      error: (error) => {
        this.exporting.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível gerar a exportação.'
        );
      },
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Recebida',
      IN_REVIEW: 'Em análise',
      APPROVED: 'Aprovada',
      REJECTED: 'Recusada',
      COMPLETED: 'Concluída',
      CANCELED: 'Cancelada',
    };
    return labels[status] || status;
  }

  statusTone(status: string): Tone {
    if (status === 'COMPLETED' || status === 'APPROVED') return 'success';
    if (status === 'REJECTED' || status === 'CANCELED') return 'error';
    if (status === 'IN_REVIEW') return 'info';
    return 'warning';
  }

  typeLabel(type: PrivacyRequestType): string {
    return this.requestTypes.find((item) => item.value === type)?.label || type;
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  contactValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
  }
}

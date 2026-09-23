import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BillingCurrent,
  BillingService,
  SaasPlan,
  SaasPlanKey,
} from '../../../core/services/billing.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsPageHeaderComponent,
} from '../../../shared/design-system';

type BillingTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-admin-billing',
  standalone: true,
  imports: [
    CommonModule,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css',
})
export class BillingComponent implements OnInit {
  private billingService = inject(BillingService);
  private notification = inject(NotificationService);
  private route = inject(ActivatedRoute);

  data = signal<BillingCurrent | null>(null);
  loading = signal(true);
  actionPlan = signal<SaasPlanKey | null>(null);
  portalLoading = signal(false);

  ngOnInit(): void {
    const billingResult = this.route.snapshot.queryParamMap.get('billing');
    if (billingResult === 'success') {
      this.notification.showSuccess(
        'Checkout concluído. O plano será atualizado após a confirmação do Stripe.'
      );
    } else if (billingResult === 'cancelled') {
      this.notification.showError('Checkout cancelado. Seu plano atual não foi alterado.');
    }

    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.billingService.getCurrent().subscribe({
      next: (response) => {
        this.data.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.loading.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível carregar a assinatura.'
        );
      },
    });
  }

  choosePlan(plan: SaasPlan): void {
    if (
      plan.key === 'starter' ||
      plan.key === this.data()?.plan.key ||
      !plan.checkoutAvailable
    ) {
      return;
    }

    this.actionPlan.set(plan.key);
    this.billingService
      .createCheckout(plan.key as Exclude<SaasPlanKey, 'starter'>)
      .subscribe({
        next: (response) => {
          const url = response.data.checkoutUrl;
          if (url) {
            window.location.assign(url);
          }
        },
        error: (error) => {
          this.actionPlan.set(null);
          this.notification.showError(
            error.error?.message || 'Não foi possível abrir o checkout.'
          );
        },
      });
  }

  manageBilling(): void {
    if (!this.data()?.subscription.hasBillingCustomer) return;

    this.portalLoading.set(true);
    this.billingService.createPortal().subscribe({
      next: (response) => {
        const url = response.data.portalUrl;
        if (url) {
          window.location.assign(url);
        }
      },
      error: (error) => {
        this.portalLoading.set(false);
        this.notification.showError(
          error.error?.message || 'Não foi possível abrir o portal de cobrança.'
        );
      },
    });
  }

  formatPrice(plan: SaasPlan): string {
    if (plan.key === 'starter') return 'Gratuito';
    if (plan.monthlyPriceCents === null) return 'Preço sob configuração';

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: plan.currency,
    }).format(plan.monthlyPriceCents / 100) + '/mês';
  }

  formatDate(value: string | null): string {
    if (!value) return '—';
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      FREE: 'Gratuito',
      TRIALING: 'Em teste',
      ACTIVE: 'Ativa',
      PAST_DUE: 'Pagamento pendente',
      PAUSED: 'Pausada',
      CANCELED: 'Cancelada',
      INCOMPLETE: 'Incompleta',
      UNPAID: 'Não paga',
    };
    return labels[status] || status;
  }

  statusTone(status: string): BillingTone {
    if (['ACTIVE', 'TRIALING'].includes(status)) return 'success';
    if (['PAST_DUE', 'INCOMPLETE'].includes(status)) return 'warning';
    if (['CANCELED', 'UNPAID'].includes(status)) return 'error';
    if (status === 'PAUSED') return 'info';
    return 'neutral';
  }

  moduleLimit(plan: SaasPlan): string {
    return plan.entitlements.specialtyModules === null
      ? 'Ilimitados'
      : String(plan.entitlements.specialtyModules);
  }

  planActionLabel(plan: SaasPlan): string {
    if (plan.key === this.data()?.plan.key) return 'Plano atual';
    if (plan.key === 'starter') return 'Plano base';
    if (!this.data()?.billingEnabled) return 'Cobrança desabilitada';
    if (!plan.checkoutAvailable) return 'Preço não configurado';
    return 'Escolher plano';
  }
}

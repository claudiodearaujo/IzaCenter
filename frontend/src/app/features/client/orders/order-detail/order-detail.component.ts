import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';
import {
  DsBadgeComponent,
  DsButtonComponent,
  DsCardComponent,
  DsEmptyStateComponent,
} from '../../../../shared/design-system';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  questions: string[];
  product: {
    id: string;
    name: string;
    productType: string;
    serviceKind?: string;
    coverImageUrl?: string;
  };
  reading?: {
    id: string;
    status: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod?: string;
  subtotal: number;
  discount: number;
  total: number;
  notes?: string;
  paidAt?: string;
  createdAt: string;
  items: OrderItem[];
  user: {
    fullName: string;
    email: string;
  };
}

type StatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    SkeletonModule,
    CurrencyBrlPipe,
    DsBadgeComponent,
    DsButtonComponent,
    DsCardComponent,
    DsEmptyStateComponent,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css',
})
export class OrderDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);
  private location = inject(Location);

  order = signal<Order | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  showSuccessBanner = signal(false);
  downloadingPdf = signal(false);

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    const success = this.route.snapshot.queryParamMap.get('success');

    if (success === 'true') {
      this.showSuccessBanner.set(true);
      this.location.replaceState(`/cliente/pedidos/${orderId}`);
    }

    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(id: string): void {
    this.loading.set(true);

    this.api.get<{ data: Order }>(`/orders/my/${id}`).subscribe({
      next: (response) => {
        this.order.set(response.data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao carregar pedido');
        this.loading.set(false);
      },
    });
  }

  downloadPdf(): void {
    const orderId = this.order()?.id;
    if (!orderId) return;

    this.downloadingPdf.set(true);

    this.api.getBlob(`/orders/my/${orderId}/pdf`).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `pedido-${this.order()?.orderNumber ?? orderId}.pdf`;
        anchor.click();
        URL.revokeObjectURL(url);
        this.downloadingPdf.set(false);
      },
      error: () => {
        this.downloadingPdf.set(false);
        window.print();
      },
    });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.orders.statusPending'),
      WAITING: this.translate.instant('client.readings.statusWaiting'),
      PAID: this.translate.instant('client.orders.statusPaid'),
      PROCESSING: this.translate.instant('client.orders.statusProcessing'),
      IN_PROGRESS: this.translate.instant('client.readings.statusInProgress'),
      COMPLETED: this.translate.instant('client.orders.statusCompleted'),
      PUBLISHED: this.translate.instant('client.readings.statusPublished'),
      CANCELLED: this.translate.instant('client.orders.statusCancelled'),
      REFUNDED: this.translate.instant('client.orders.statusRefunded'),
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): StatusTone {
    const tones: Record<string, StatusTone> = {
      PENDING: 'warning',
      WAITING: 'warning',
      PAID: 'info',
      PROCESSING: 'brand',
      IN_PROGRESS: 'brand',
      COMPLETED: 'success',
      PUBLISHED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'neutral',
    };
    return tones[status] || 'neutral';
  }

  // Compatibility for the legacy order-detail template while this screen
  // finishes its migration to DsBadgeComponent.
  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      WAITING: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
      PAID: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
      PROCESSING: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
      IN_PROGRESS: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
      COMPLETED: 'text-green-400 border-green-500/30 bg-green-500/10',
      PUBLISHED: 'text-green-400 border-green-500/30 bg-green-500/10',
      CANCELLED: 'text-red-400 border-red-500/30 bg-red-500/10',
      REFUNDED: 'text-secondary border-primary/10',
    };
    return classes[status] || 'text-secondary border-primary/10';
  }

  getPaymentLabel(method?: string): string {
    const labels: Record<string, string> = {
      card: this.translate.instant('client.orders.detail.paymentCard'),
      pix: this.translate.instant('client.orders.detail.paymentPix'),
      boleto: this.translate.instant('client.orders.detail.paymentBoleto'),
    };
    return method
      ? labels[method] || method
      : this.translate.instant('client.orders.detail.paymentNotInformed');
  }

  getServiceKindLabel(kind?: string, legacyType?: string): string {
    const resolvedKind = kind || this.serviceKindFromLegacy(legacyType);
    const labels: Record<string, string> = {
      SERVICE: 'Serviço',
      SESSION: 'Sessão',
      PACKAGE: 'Pacote',
      ASYNC_SERVICE: 'Serviço assíncrono',
      DIGITAL_PRODUCT: 'Produto digital',
    };
    return labels[resolvedKind] || resolvedKind;
  }

  private serviceKindFromLegacy(type?: string): string {
    switch (type) {
      case 'SESSION': return 'SESSION';
      case 'MONTHLY': return 'PACKAGE';
      case 'QUESTION': return 'ASYNC_SERVICE';
      default: return 'SERVICE';
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

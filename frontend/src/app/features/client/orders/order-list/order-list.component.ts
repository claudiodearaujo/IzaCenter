import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { ApiService } from '../../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';
import {
  DsBadgeComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsPageHeaderComponent,
} from '../../../../shared/design-system';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  _count?: {
    items: number;
  };
}

interface OrdersResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type OrderTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    SkeletonModule,
    PaginatorModule,
    CurrencyBrlPipe,
    DsBadgeComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent implements OnInit {
  private api = inject(ApiService);
  private translate = inject(TranslateService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  totalRecords = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);

    this.api
      .get<OrdersResponse>('/users/me/orders', {
        params: {
          page: this.currentPage(),
          limit: this.pageSize,
        },
      })
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
          this.totalRecords.set(response.meta.total);
          this.loading.set(false);
        },
        error: () => {
          this.orders.set([]);
          this.loading.set(false);
        },
      });
  }

  onPageChange(event: PaginatorState): void {
    this.currentPage.set((event.page || 0) + 1);
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.orders.statusPending'),
      PAID: this.translate.instant('client.orders.statusPaid'),
      PROCESSING: this.translate.instant('client.orders.statusProcessing'),
      COMPLETED: this.translate.instant('client.orders.statusCompleted'),
      CANCELLED: this.translate.instant('client.orders.statusCancelled'),
      REFUNDED: this.translate.instant('client.orders.statusRefunded'),
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): OrderTone {
    const tones: Record<string, OrderTone> = {
      PENDING: 'warning',
      PAID: 'info',
      PROCESSING: 'brand',
      COMPLETED: 'success',
      CANCELLED: 'error',
      REFUNDED: 'neutral',
    };
    return tones[status] || 'neutral';
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

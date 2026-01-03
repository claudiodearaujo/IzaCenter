// apps/frontend/src/app/features/client/orders/order-list/order-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';

import { ApiService } from '../../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';

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

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    SkeletonModule,
    PaginatorModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
})
export class OrderListComponent implements OnInit {
  private api = inject(ApiService);

  orders = signal<Order[]>([]);
  loading = signal(true);
  totalRecords = signal(0);
  currentPage = signal(1);
  pageSize = 10;

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);

    this.api
      .get<OrdersResponse>('/users/me/orders', {
        page: this.currentPage(),
        limit: this.pageSize,
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

  onPageChange(event: PaginatorState) {
    this.currentPage.set((event.page || 0) + 1);
    this.loadOrders();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-blue-500/20 text-blue-400',
      PROCESSING: 'bg-purple-500/20 text-purple-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      REFUNDED: 'bg-red-500/20 text-red-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
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

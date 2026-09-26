import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import {
  DsBadgeComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsPageHeaderComponent,
} from '../../../shared/design-system';

interface DashboardStats {
  totalOrders: number;
  pendingReadings: number;
  completedReadings: number;
  upcomingAppointments: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
}

interface RecentReading {
  id: string;
  title: string;
  status: string;
  publishedAt?: string;
  product?: { name: string };
}

type DashboardTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    SkeletonModule,
    CurrencyBrlPipe,
    DsBadgeComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private translate = inject(TranslateService);
  authService = inject(AuthService);

  user = this.authService.user;
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  recentReadings = signal<RecentReading[]>([]);
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.api.get<{ data: DashboardStats }>('/users/statistics').subscribe({
      next: (response) => this.stats.set(response.data),
      error: () => this.stats.set({
        totalOrders: 0,
        pendingReadings: 0,
        completedReadings: 0,
        upcomingAppointments: 0,
      }),
    });

    this.api
      .get<{ data: RecentOrder[] }>('/orders/my', { params: { limit: 5 } })
      .subscribe({
        next: (response) => this.recentOrders.set(response.data),
        error: () => this.recentOrders.set([]),
      });

    this.api
      .get<{ data: RecentReading[] }>('/deliveries', { params: { limit: 5 } })
      .subscribe({
        next: (response) => {
          this.recentReadings.set(response.data);
          this.loading.set(false);
        },
        error: () => {
          this.recentReadings.set([]);
          this.loading.set(false);
        },
      });
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.orders.statusPending'),
      PAID: this.translate.instant('client.orders.statusPaid'),
      PROCESSING: this.translate.instant('client.orders.statusProcessing'),
      COMPLETED: this.translate.instant('client.orders.statusCompleted'),
      CANCELLED: this.translate.instant('client.orders.statusCancelled'),
      REFUNDED: this.translate.instant('client.orders.statusRefunded'),
      WAITING: this.translate.instant('client.readings.statusWaiting'),
      IN_PROGRESS: this.translate.instant('client.readings.statusInProgress'),
      PUBLISHED: this.translate.instant('client.readings.statusPublished'),
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): DashboardTone {
    const tones: Record<string, DashboardTone> = {
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

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

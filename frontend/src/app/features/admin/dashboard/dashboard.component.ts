// apps/frontend/src/app/features/admin/dashboard/dashboard.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import {
  DashboardService,
  DashboardStats,
  RecentOrder,
  SalesChartData,
} from '../../../core/services/dashboard.service';
import { ReadingsService, Reading } from '../../../core/services/readings.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';
import {
  DsAvatarComponent,
  DsBadgeComponent,
  DsCardComponent,
  DsEmptyStateComponent,
  DsPageHeaderComponent,
} from '../../../shared/design-system';

type DashboardStatusTone = 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SkeletonModule,
    ChartModule,
    CurrencyBrlPipe,
    TranslateModule,
    DsAvatarComponent,
    DsBadgeComponent,
    DsCardComponent,
    DsEmptyStateComponent,
    DsPageHeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private readingsService = inject(ReadingsService);
  private translate = inject(TranslateService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  pendingReadings = signal<Reading[]>([]);
  loading = signal(true);

  revenueChartData: any;
  revenueChartOptions: any;

  ngOnInit(): void {
    this.loadDashboard();
    this.initCharts();
  }

  loadDashboard(): void {
    this.loading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
      },
      error: () => {
        this.stats.set({
          totalOrders: 0,
          ordersGrowth: 0,
          totalRevenue: 0,
          revenueGrowth: 0,
          totalUsers: 0,
          usersGrowth: 0,
          totalProducts: 0,
          pendingReadings: 0,
          upcomingAppointments: 0,
          pendingTestimonials: 0,
        });
      },
    });

    this.dashboardService.getRecentOrders(5).subscribe({
      next: (response) => {
        this.recentOrders.set(response.data);
      },
      error: () => {
        this.recentOrders.set([]);
      },
    });

    this.readingsService.findAll({ status: 'PENDING', limit: 5 }).subscribe({
      next: (response) => {
        this.pendingReadings.set(response.data);
        this.loading.set(false);
      },
      error: () => {
        this.pendingReadings.set([]);
        this.loading.set(false);
      },
    });

    this.dashboardService.getSalesChart('month').subscribe({
      next: (response) => {
        this.updateRevenueChart(response.data);
      },
    });
  }

  updateRevenueChart(chartData: SalesChartData): void {
    this.revenueChartData = {
      ...chartData,
      datasets: chartData.datasets.map((dataset) => ({
        ...dataset,
        borderColor: '#477762',
        backgroundColor: 'rgba(71, 119, 98, 0.12)',
        pointBackgroundColor: '#477762',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#385E4E',
        fill: true,
        tension: 0.35,
      })),
    };
  }

  initCharts(): void {
    this.revenueChartOptions = {
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: '#7D7A73' },
          grid: { color: 'rgba(30, 30, 27, 0.06)' },
          border: { display: false },
        },
        y: {
          ticks: { color: '#7D7A73' },
          grid: { color: 'rgba(30, 30, 27, 0.06)' },
          border: { display: false },
        },
      },
    };
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: this.translate.instant('client.orders.statusPending'),
      PAID: this.translate.instant('client.orders.statusPaid'),
      PROCESSING: this.translate.instant('client.orders.statusProcessing'),
      COMPLETED: this.translate.instant('client.orders.statusCompleted'),
      WAITING: this.translate.instant('admin.readings.statusWaiting'),
      IN_PROGRESS: this.translate.instant('admin.readings.statusInProgress'),
    };
    return labels[status] || status;
  }

  getStatusTone(status: string): DashboardStatusTone {
    const tones: Record<string, DashboardStatusTone> = {
      PENDING: 'warning',
      WAITING: 'warning',
      PAID: 'success',
      PROCESSING: 'brand',
      IN_PROGRESS: 'brand',
      COMPLETED: 'success',
    };
    return tones[status] || 'neutral';
  }

  formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}

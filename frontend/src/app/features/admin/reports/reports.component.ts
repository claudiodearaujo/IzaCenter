import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { TranslateModule } from '@ngx-translate/core';

import {
  DashboardService,
  DashboardStats,
  SalesChartData,
  TopProduct,
} from '../../../core/services/dashboard.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    Select,
    TagModule,
    ChartModule,
    SkeletonModule,
    TranslateModule,
  ],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css',
})
export class AdminReportsComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private notification = inject(NotificationService);

  loading = signal(true);
  stats = signal<DashboardStats | null>(null);
  salesChartData = signal<SalesChartData | null>(null);
  topProducts = signal<TopProduct[]>([]);
  period = signal<string>('month');

  periodOptions = [
    { label: 'Semana', value: 'week' },
    { label: 'Mês', value: 'month' },
    { label: 'Ano', value: 'year' },
  ];

  chartOptions: any = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'rgba(120, 53, 15, 0.7)',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(120, 53, 15, 0.7)' },
        grid: { color: 'rgba(217, 119, 6, 0.1)' },
      },
      y: {
        ticks: { color: 'rgba(120, 53, 15, 0.7)' },
        grid: { color: 'rgba(217, 119, 6, 0.1)' },
      },
    },
  };

  ngOnInit() {
    this.loadReports();
    this.loadSalesChart();
    this.loadTopProducts();
  }

  loadReports() {
    this.loading.set(true);

    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
        this.loading.set(false);
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
        this.loading.set(false);
        this.notification.error('admin.reports.errorLoading');
      },
    });
  }

  loadSalesChart() {
    this.dashboardService.getSalesChart(this.period() as 'week' | 'month' | 'year').subscribe({
      next: (response) => {
        this.salesChartData.set(response.data);
      },
      error: () => {
        this.salesChartData.set(null);
      },
    });
  }

  loadTopProducts() {
    this.dashboardService.getTopProducts().subscribe({
      next: (response) => {
        this.topProducts.set(response.data);
      },
      error: () => {
        this.topProducts.set([]);
      },
    });
  }

  onPeriodChange() {
    this.loadSalesChart();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}

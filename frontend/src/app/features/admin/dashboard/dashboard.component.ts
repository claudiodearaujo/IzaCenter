// apps/frontend/src/app/features/admin/dashboard/dashboard.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';
import { ChartModule } from 'primeng/chart';

import {
  DashboardService,
  DashboardStats,
  RecentOrder,
  SalesChartData,
} from '../../../core/services/dashboard.service';
import { ReadingsService, Reading } from '../../../core/services/readings.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    SkeletonModule,
    ChartModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private readingsService = inject(ReadingsService);

  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  pendingReadings = signal<Reading[]>([]);
  loading = signal(true);

  // Chart data
  revenueChartData: any;
  revenueChartOptions: any;
  ordersChartData: any;
  ordersChartOptions: any;

  ngOnInit() {
    this.loadDashboard();
    this.initCharts();
  }

  loadDashboard() {
    this.loading.set(true);

    // Load stats
    this.dashboardService.getStats().subscribe({
      next: (response) => {
        this.stats.set(response.data);
      },
      error: () => {
        // Use default values
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

    // Load recent orders
    this.dashboardService.getRecentOrders(5).subscribe({
      next: (response) => {
        this.recentOrders.set(response.data);
      },
      error: () => {
        this.recentOrders.set([]);
      },
    });

    // Load pending readings
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

    // Load sales chart data
    this.dashboardService.getSalesChart('month').subscribe({
      next: (response) => {
        this.updateRevenueChart(response.data);
      },
    });
  }

  updateRevenueChart(chartData: SalesChartData) {
    this.revenueChartData = chartData;
  }

  initCharts() {
    const documentStyle = getComputedStyle(document.documentElement);
    const primaryColor = '#c9a7eb';

    this.revenueChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(160, 132, 184, 0.7)' },
          grid: { color: 'rgba(201, 167, 235, 0.1)' },
        },
        y: {
          ticks: { color: 'rgba(160, 132, 184, 0.7)' },
          grid: { color: 'rgba(201, 167, 235, 0.1)' },
        },
      },
    };

    // Orders Chart
    this.ordersChartData = {
      labels: ['Perguntas', 'Sessões', 'Mensal', 'Especial'],
      datasets: [
        {
          data: [45, 25, 20, 10],
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)',
            'rgba(201, 167, 235, 0.8)',
            'rgba(217, 176, 255, 0.8)',
            'rgba(245, 158, 11, 0.8)',
          ],
        },
      ],
    };

    this.ordersChartOptions = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(160, 132, 184, 0.7)',
          },
        },
      },
    };
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendente',
      PAID: 'Pago',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      WAITING: 'Aguardando',
      IN_PROGRESS: 'Em andamento',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      WAITING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-blue-500/20 text-blue-400',
      PROCESSING: 'bg-purple-500/20 text-purple-400',
      IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
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

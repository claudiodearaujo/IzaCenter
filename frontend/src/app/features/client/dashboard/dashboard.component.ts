// apps/frontend/src/app/features/client/dashboard/dashboard.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { SkeletonModule } from 'primeng/skeleton';

import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

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
  product?: {
    name: string;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    SkeletonModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);

  user = this.authService.user;
  stats = signal<DashboardStats | null>(null);
  recentOrders = signal<RecentOrder[]>([]);
  recentReadings = signal<RecentReading[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard() {
    this.loading.set(true);

    // Load stats
    this.api.get<{ data: DashboardStats }>('/users/me/stats').subscribe({
      next: (response) => {
        this.stats.set(response.data);
      },
      error: () => {
        // Use default values
        this.stats.set({
          totalOrders: 0,
          pendingReadings: 0,
          completedReadings: 0,
          upcomingAppointments: 0,
        });
      },
    });

    // Load recent orders
    this.api
      .get<{ data: RecentOrder[] }>('/users/me/orders', { params: { limit: 5 } })
      .subscribe({
        next: (response) => {
          this.recentOrders.set(response.data);
        },
        error: () => {
          this.recentOrders.set([]);
        },
      });

    // Load recent readings
    this.api
      .get<{ data: RecentReading[] }>('/users/me/readings', { params: { limit: 5 } })
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
      // Order status
      PENDING: 'Pendente',
      PAID: 'Pago',
      PROCESSING: 'Processando',
      COMPLETED: 'Concluído',
      CANCELLED: 'Cancelado',
      REFUNDED: 'Reembolsado',
      // Reading status
      WAITING: 'Aguardando',
      IN_PROGRESS: 'Em andamento',
      PUBLISHED: 'Publicada',
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      WAITING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-blue-500/20 text-blue-400',
      PROCESSING: 'bg-blue-500/20 text-blue-400',
      IN_PROGRESS: 'bg-blue-500/20 text-blue-400',
      COMPLETED: 'bg-green-500/20 text-green-400',
      PUBLISHED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
      REFUNDED: 'bg-red-500/20 text-red-400',
    };
    return classes[status] || 'bg-gray-500/20 text-gray-400';
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

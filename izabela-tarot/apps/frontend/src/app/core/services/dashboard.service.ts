// apps/frontend/src/app/core/services/dashboard.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface DashboardStats {
  totalOrders: number;
  ordersToday?: number;
  ordersGrowth: number;
  totalRevenue: number;
  revenueToday?: number;
  revenueGrowth: number;
  totalUsers: number;
  newUsersToday?: number;
  usersGrowth: number;
  totalProducts: number;
  activeProducts?: number;
  pendingReadings: number;
  publishedReadings?: number;
  upcomingAppointments: number;
  pendingAppointments?: number;
  pendingTestimonials: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: Date;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  items: {
    product: {
      id: string;
      name: string;
    };
    quantity: number;
  }[];
}

export interface RecentUser {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface SalesChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
  }[];
}

export interface TopProduct {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
  totalSold: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(ApiService);

  getStats(): Observable<ApiResponse<DashboardStats>> {
    return this.api.get<ApiResponse<DashboardStats>>('/admin/dashboard/stats');
  }

  getRecentOrders(limit?: number): Observable<ApiResponse<RecentOrder[]>> {
    return this.api.get<ApiResponse<RecentOrder[]>>('/admin/dashboard/recent-orders', {
      params: limit ? { limit } : {}
    });
  }

  getRecentUsers(limit?: number): Observable<ApiResponse<RecentUser[]>> {
    return this.api.get<ApiResponse<RecentUser[]>>('/admin/dashboard/recent-users', {
      params: limit ? { limit } : {}
    });
  }

  getSalesChart(period?: 'week' | 'month' | 'year'): Observable<ApiResponse<SalesChartData>> {
    return this.api.get<ApiResponse<SalesChartData>>('/admin/dashboard/sales-chart', {
      params: period ? { period } : {}
    });
  }

  getTopProducts(limit?: number): Observable<ApiResponse<TopProduct[]>> {
    return this.api.get<ApiResponse<TopProduct[]>>('/admin/dashboard/top-products', {
      params: limit ? { limit } : {}
    });
  }
}

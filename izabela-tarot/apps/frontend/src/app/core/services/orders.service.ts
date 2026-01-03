// apps/frontend/src/app/core/services/orders.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';

export interface Order {
  id: string;
  orderNumber: string;
  clientId: string;
  subtotal: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  paymentStatus: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED';
  clientNotes?: string;
  adminNotes?: string;
  paidAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    fullName: string;
    email: string;
  };
  items: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  clientQuestions: string[];
  product?: {
    id: string;
    name: string;
    coverImageUrl?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private api = inject(ApiService);

  // Client methods
  getMyOrders(): Observable<ApiResponse<Order[]>> {
    return this.api.get<ApiResponse<Order[]>>('/orders');
  }

  getMyOrderById(id: string): Observable<ApiResponse<Order>> {
    return this.api.get<ApiResponse<Order>>(`/orders/${id}`);
  }

  // Admin methods
  findAll(params?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Order>> {
    const queryParams: any = { ...params };
    if (params?.startDate) queryParams.startDate = params.startDate.toISOString();
    if (params?.endDate) queryParams.endDate = params.endDate.toISOString();
    return this.api.get<PaginatedResponse<Order>>('/admin/orders', { params: queryParams });
  }

  findById(id: string): Observable<ApiResponse<Order>> {
    return this.api.get<ApiResponse<Order>>(`/admin/orders/${id}`);
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<Order>> {
    return this.api.patch<ApiResponse<Order>>(`/admin/orders/${id}/status`, { status });
  }

  updateAdminNotes(id: string, adminNotes: string): Observable<ApiResponse<Order>> {
    return this.api.patch<ApiResponse<Order>>(`/admin/orders/${id}`, { adminNotes });
  }

  getStats(): Observable<ApiResponse<{
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  }>> {
    return this.api.get('/admin/orders/stats');
  }
}

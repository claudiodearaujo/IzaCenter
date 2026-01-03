// apps/frontend/src/app/core/services/users.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  birthDate?: Date;
  avatarUrl?: string;
  role: 'CLIENT' | 'ADMIN';
  preferredLanguage: string;
  notificationEmail: boolean;
  notificationWhatsapp: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  _count?: {
    orders: number;
    readings: number;
    appointments: number;
  };
}

export interface UpdateUserDTO {
  fullName?: string;
  phone?: string;
  birthDate?: Date;
  avatarUrl?: string;
  preferredLanguage?: string;
  notificationEmail?: boolean;
  notificationWhatsapp?: boolean;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private api = inject(ApiService);

  // Client methods
  getProfile(): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>('/users/profile');
  }

  updateProfile(data: UpdateUserDTO): Observable<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>('/users/profile', data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/users/change-password', {
      currentPassword,
      newPassword
    });
  }

  // Admin methods
  findAll(params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<User>> {
    return this.api.get<PaginatedResponse<User>>('/admin/users', { params: params as any });
  }

  findById(id: string): Observable<ApiResponse<User>> {
    return this.api.get<ApiResponse<User>>(`/admin/users/${id}`);
  }

  update(id: string, data: UpdateUserDTO): Observable<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>(`/admin/users/${id}`, data);
  }

  updateRole(id: string, role: string): Observable<ApiResponse<User>> {
    return this.api.patch<ApiResponse<User>>(`/admin/users/${id}/role`, { role });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/users/${id}`);
  }

  getStats(): Observable<ApiResponse<{
    total: number;
    clients: number;
    admins: number;
    newThisMonth: number;
  }>> {
    return this.api.get('/admin/users/stats');
  }
}

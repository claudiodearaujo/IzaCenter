// apps/frontend/src/app/core/services/testimonials.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';

export interface Testimonial {
  id: string;
  clientId?: string;
  clientName: string;
  clientAvatarUrl?: string;
  content: string;
  rating?: number;
  isApproved: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  client?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface CreateTestimonialDTO {
  content: string;
  rating: number;
}

@Injectable({
  providedIn: 'root'
})
export class TestimonialsService {
  private api = inject(ApiService);

  // Public methods
  findPublic(limit?: number): Observable<ApiResponse<Testimonial[]>> {
    return this.api.get<ApiResponse<Testimonial[]>>('/testimonials', {
      params: limit ? { limit } : {}
    });
  }

  findFeatured(limit?: number): Observable<ApiResponse<Testimonial[]>> {
    return this.api.get<ApiResponse<Testimonial[]>>('/testimonials/featured', {
      params: limit ? { limit } : {}
    });
  }

  // Client methods
  create(data: CreateTestimonialDTO): Observable<ApiResponse<Testimonial>> {
    return this.api.post<ApiResponse<Testimonial>>('/testimonials', data);
  }

  // Admin methods
  findAll(params?: {
    isApproved?: boolean;
    isFeatured?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Testimonial>> {
    return this.api.get<PaginatedResponse<Testimonial>>('/admin/testimonials', { params: params as any });
  }

  getStats(): Observable<ApiResponse<{
    total: number;
    approved: number;
    pending: number;
    averageRating: number;
  }>> {
    return this.api.get('/admin/testimonials/stats');
  }

  update(id: string, data: { isApproved?: boolean; isFeatured?: boolean }): Observable<ApiResponse<Testimonial>> {
    return this.api.patch<ApiResponse<Testimonial>>(`/admin/testimonials/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/testimonials/${id}`);
  }
}

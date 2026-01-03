// apps/frontend/src/app/core/services/products.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';

export interface Product {
  id: string;
  categoryId?: string;
  name: string;
  slug: string;
  shortDescription?: string;
  fullDescription?: string;
  productType: 'QUESTION' | 'SESSION' | 'MONTHLY' | 'SPECIAL';
  price: number;
  originalPrice?: number;
  numQuestions?: number;
  sessionDurationMinutes?: number;
  numCards?: number;
  validityDays: number;
  coverImageUrl?: string;
  galleryUrls: string[];
  isActive: boolean;
  isFeatured: boolean;
  requiresScheduling: boolean;
  maxPerClient?: number;
  metaTitle?: string;
  metaDescription?: string;
  availableFrom?: Date;
  availableUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface CreateProductDTO {
  name: string;
  categoryId?: string;
  shortDescription?: string;
  fullDescription?: string;
  productType: string;
  price: number;
  originalPrice?: number;
  numQuestions?: number;
  sessionDurationMinutes?: number;
  numCards?: number;
  validityDays?: number;
  coverImageUrl?: string;
  galleryUrls?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  requiresScheduling?: boolean;
  maxPerClient?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private api = inject(ApiService);

  // Public methods
  findAll(params?: {
    category?: string;
    search?: string;
    featured?: boolean;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Product>> {
    return this.api.get<PaginatedResponse<Product>>('/products', { params: params as any });
  }

  findBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.api.get<ApiResponse<Product>>(`/products/${slug}`);
  }

  findFeatured(limit?: number): Observable<ApiResponse<Product[]>> {
    return this.api.get<ApiResponse<Product[]>>('/products/featured', {
      params: limit ? { limit } : {}
    });
  }

  // Admin methods
  findAllAdmin(params?: {
    category?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Product>> {
    return this.api.get<PaginatedResponse<Product>>('/admin/products', { params: params as any });
  }

  findById(id: string): Observable<ApiResponse<Product>> {
    return this.api.get<ApiResponse<Product>>(`/admin/products/${id}`);
  }

  create(data: CreateProductDTO): Observable<ApiResponse<Product>> {
    return this.api.post<ApiResponse<Product>>('/admin/products', data);
  }

  update(id: string, data: UpdateProductDTO): Observable<ApiResponse<Product>> {
    return this.api.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/products/${id}`);
  }

  uploadImage(file: File): Observable<{ url: string }> {
    return this.api.upload<{ url: string }>('/upload/image', file);
  }
}

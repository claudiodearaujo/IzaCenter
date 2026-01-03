// apps/frontend/src/app/core/services/categories.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  _count?: {
    products: number;
  };
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private api = inject(ApiService);

  // Public methods
  findAll(): Observable<ApiResponse<ProductCategory[]>> {
    return this.api.get<ApiResponse<ProductCategory[]>>('/categories');
  }

  findBySlug(slug: string): Observable<ApiResponse<ProductCategory>> {
    return this.api.get<ApiResponse<ProductCategory>>(`/categories/${slug}`);
  }

  // Admin methods
  findAllAdmin(): Observable<ApiResponse<ProductCategory[]>> {
    return this.api.get<ApiResponse<ProductCategory[]>>('/admin/categories');
  }

  create(data: CreateCategoryDTO): Observable<ApiResponse<ProductCategory>> {
    return this.api.post<ApiResponse<ProductCategory>>('/admin/categories', data);
  }

  update(id: string, data: UpdateCategoryDTO): Observable<ApiResponse<ProductCategory>> {
    return this.api.put<ApiResponse<ProductCategory>>(`/admin/categories/${id}`, data);
  }

  reorder(id: string, order: number): Observable<ApiResponse<ProductCategory>> {
    return this.api.patch<ApiResponse<ProductCategory>>(`/admin/categories/${id}/reorder`, { order });
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/categories/${id}`);
  }
}

// apps/frontend/src/app/core/services/readings.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';
import { CiganoCard } from './cards.service';

export interface Reading {
  id: string;
  title: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'PUBLISHED' | 'ARCHIVED';
  clientQuestion?: string;
  focusArea?: string;
  introduction?: string;
  interpretation?: string;
  advice?: string;
  conclusion?: string;
  audioUrl?: string;
  videoUrl?: string;
  readingDate?: Date;
  publishedAt?: Date;
  expiresAt?: Date;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    fullName: string;
    email: string;
  };
  orderItem?: {
    product: {
      id: string;
      name: string;
    };
    clientQuestions: string[];
  };
  cards?: ReadingCard[];
}

export interface ReadingCard {
  id?: string;
  cardId: string;
  position: number;
  positionName?: string;
  isReversed?: boolean;
  interpretation?: string;
  card?: CiganoCard;
}

export interface UpdateReadingDTO {
  title?: string;
  introduction?: string;
  interpretation?: string;
  advice?: string;
  conclusion?: string;
  cards?: {
    cardId: string;
    position: number;
    positionName?: string;
    interpretation?: string;
    isReversed?: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReadingsService {
  private api = inject(ApiService);

  // Admin methods
  findAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Reading>> {
    return this.api.get<PaginatedResponse<Reading>>('/admin/readings', { params: params as any });
  }

  findById(id: string): Observable<ApiResponse<Reading>> {
    return this.api.get<ApiResponse<Reading>>(`/admin/readings/${id}`);
  }

  update(id: string, data: UpdateReadingDTO): Observable<ApiResponse<Reading>> {
    return this.api.put<ApiResponse<Reading>>(`/admin/readings/${id}`, data);
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<Reading>> {
    return this.api.patch<ApiResponse<Reading>>(`/admin/readings/${id}/status`, { status });
  }

  updateAudio(id: string, audioUrl: string): Observable<ApiResponse<Reading>> {
    return this.api.patch<ApiResponse<Reading>>(`/admin/readings/${id}/audio`, { audioUrl });
  }

  uploadAudio(id: string, file: File): Observable<ApiResponse<Reading>> {
    return this.api.upload<ApiResponse<Reading>>(`/admin/readings/${id}/upload-audio`, file);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/readings/${id}`);
  }

  getStats(): Observable<ApiResponse<{
    total: number;
    pending: number;
    inProgress: number;
    published: number;
  }>> {
    return this.api.get('/admin/readings/stats');
  }

  // Client methods
  getMyReadings(): Observable<ApiResponse<Reading[]>> {
    return this.api.get<ApiResponse<Reading[]>>('/readings');
  }

  getMyReadingById(id: string): Observable<ApiResponse<Reading>> {
    return this.api.get<ApiResponse<Reading>>(`/readings/${id}`);
  }
}

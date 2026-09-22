// Compatibility service during Delivery Domain v3.
// Canonical API routes use /deliveries; the Reading names remain as aliases
// until the legacy UI/modules are fully renamed.

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';
import {
  Delivery,
  DeliveryCard,
  UpdateDeliveryDTO,
} from '../models/delivery.model';

export type Reading = Delivery;
export type ReadingCard = DeliveryCard;
export type UpdateReadingDTO = UpdateDeliveryDTO;

@Injectable({
  providedIn: 'root'
})
export class ReadingsService {
  private api = inject(ApiService);

  // Admin methods — canonical Delivery API.
  findAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Delivery>> {
    return this.api.get<PaginatedResponse<Delivery>>('/admin/deliveries', { params: params as any });
  }

  findById(id: string): Observable<ApiResponse<Delivery>> {
    return this.api.get<ApiResponse<Delivery>>(`/admin/deliveries/${id}`);
  }

  update(id: string, data: UpdateDeliveryDTO): Observable<ApiResponse<Delivery>> {
    return this.api.put<ApiResponse<Delivery>>(`/admin/deliveries/${id}`, data);
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<Delivery>> {
    return this.api.patch<ApiResponse<Delivery>>(`/admin/deliveries/${id}/status`, { status });
  }

  updateAudio(id: string, audioUrl: string): Observable<ApiResponse<Delivery>> {
    return this.api.patch<ApiResponse<Delivery>>(`/admin/deliveries/${id}/audio`, { audioUrl });
  }

  // Kept for compatibility with the current upload UI.
  uploadAudio(id: string, file: File): Observable<ApiResponse<Delivery>> {
    return this.api.upload<ApiResponse<Delivery>>(`/admin/deliveries/${id}/upload-audio`, file);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/deliveries/${id}`);
  }

  getStats(): Observable<ApiResponse<{
    total: number;
    pending: number;
    inProgress: number;
    published: number;
  }>> {
    return this.api.get('/admin/deliveries/stats');
  }

  // Client methods — canonical Delivery API.
  getMyReadings(): Observable<ApiResponse<Delivery[]>> {
    return this.api.get<ApiResponse<Delivery[]>>('/deliveries');
  }

  getMyReadingById(id: string): Observable<ApiResponse<Delivery>> {
    return this.api.get<ApiResponse<Delivery>>(`/deliveries/${id}`);
  }
}

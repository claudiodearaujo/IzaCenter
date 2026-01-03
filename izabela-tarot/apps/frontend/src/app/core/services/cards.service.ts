// apps/frontend/src/app/core/services/cards.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

export interface CiganoCard {
  id: string;
  number: number;
  name: string;
  isPositive: boolean;
  generalMeaning?: string;
  loveMeaning?: string;
  workMeaning?: string;
  healthMeaning?: string;
  moneyMeaning?: string;
  imageUrl?: string;
}

export interface CreateCardDTO {
  number: number;
  name: string;
  isPositive?: boolean;
  generalMeaning?: string;
  loveMeaning?: string;
  workMeaning?: string;
  healthMeaning?: string;
  moneyMeaning?: string;
  imageUrl?: string;
}

export interface UpdateCardDTO extends Partial<CreateCardDTO> {}

@Injectable({
  providedIn: 'root'
})
export class CardsService {
  private api = inject(ApiService);

  // Public methods
  findAll(): Observable<ApiResponse<CiganoCard[]>> {
    return this.api.get<ApiResponse<CiganoCard[]>>('/cards');
  }

  findById(id: string): Observable<ApiResponse<CiganoCard>> {
    return this.api.get<ApiResponse<CiganoCard>>(`/cards/${id}`);
  }

  findByNumber(number: number): Observable<ApiResponse<CiganoCard>> {
    return this.api.get<ApiResponse<CiganoCard>>(`/cards/number/${number}`);
  }

  // Admin methods
  create(data: CreateCardDTO): Observable<ApiResponse<CiganoCard>> {
    return this.api.post<ApiResponse<CiganoCard>>('/admin/cards', data);
  }

  update(id: string, data: UpdateCardDTO): Observable<ApiResponse<CiganoCard>> {
    return this.api.put<ApiResponse<CiganoCard>>(`/admin/cards/${id}`, data);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/admin/cards/${id}`);
  }

  generateDeck(): Observable<{ message: string; count: number }> {
    return this.api.post<{ message: string; count: number }>('/admin/cards/generate-deck', {});
  }
}

// apps/frontend/src/app/core/services/appointments.service.ts

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PaginatedResponse, ApiResponse } from './api.service';

export interface Appointment {
  id: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  clientNotes?: string;
  adminNotes?: string;
  meetingUrl?: string;
  meetingPassword?: string;
  reminderSentAt?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
  client?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
  };
  orderItem?: {
    product: {
      id: string;
      name: string;
    };
  };
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppointmentsService {
  private api = inject(ApiService);

  // Public methods
  getAvailableSlots(date: Date): Observable<ApiResponse<TimeSlot[]>> {
    return this.api.get<ApiResponse<TimeSlot[]>>('/appointments/available-slots', {
      params: { date: date.toISOString() }
    });
  }

  // Client methods
  getMyAppointments(): Observable<ApiResponse<Appointment[]>> {
    return this.api.get<ApiResponse<Appointment[]>>('/appointments');
  }

  cancel(id: string, reason?: string): Observable<ApiResponse<Appointment>> {
    return this.api.post<ApiResponse<Appointment>>(`/appointments/${id}/cancel`, { reason });
  }

  // Admin methods
  findAll(params?: {
    status?: string;
    date?: Date;
    search?: string;
    page?: number;
    limit?: number;
  }): Observable<PaginatedResponse<Appointment>> {
    const queryParams: any = { ...params };
    if (params?.date) {
      queryParams.date = params.date.toISOString();
    }
    return this.api.get<PaginatedResponse<Appointment>>('/admin/appointments', { params: queryParams });
  }

  findById(id: string): Observable<ApiResponse<Appointment>> {
    return this.api.get<ApiResponse<Appointment>>(`/admin/appointments/${id}`);
  }

  updateStatus(id: string, status: string): Observable<ApiResponse<Appointment>> {
    return this.api.patch<ApiResponse<Appointment>>(`/admin/appointments/${id}/status`, { status });
  }

  reschedule(id: string, date: Date, startTime: string, endTime: string): Observable<ApiResponse<Appointment>> {
    return this.api.patch<ApiResponse<Appointment>>(`/admin/appointments/${id}/reschedule`, {
      date: date.toISOString(),
      startTime,
      endTime
    });
  }

  update(id: string, data: Partial<Appointment>): Observable<ApiResponse<Appointment>> {
    return this.api.patch<ApiResponse<Appointment>>(`/admin/appointments/${id}`, data);
  }
}

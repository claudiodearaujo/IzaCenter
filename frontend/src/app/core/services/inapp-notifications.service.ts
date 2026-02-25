// apps/frontend/src/app/core/services/inapp-notifications.service.ts

import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type?: string;
  referenceId?: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  notifications: InAppNotification[];
  unreadCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class InAppNotificationsService {
  private api = inject(ApiService);

  readonly unreadCount = signal<number>(0);

  /**
   * Fetch notifications from the API
   */
  list(unreadOnly = false): Observable<NotificationsResponse> {
    return this.api
      .get<NotificationsResponse>('/notifications', { params: { unreadOnly } })
      .pipe(
        tap((res) => this.unreadCount.set(res.unreadCount)),
      );
  }

  /**
   * Mark a single notification as read
   */
  markRead(id: string): Observable<{ success: boolean; data: InAppNotification }> {
    return this.api.patch<{ success: boolean; data: InAppNotification }>(
      `/notifications/${id}/read`,
      {}
    ).pipe(tap(() => this.unreadCount.update((c) => Math.max(0, c - 1))));
  }

  /**
   * Mark all notifications as read
   */
  markAllRead(): Observable<{ success: boolean; updated: number }> {
    return this.api
      .patch<{ success: boolean; updated: number }>('/notifications/read-all', {})
      .pipe(tap(() => this.unreadCount.set(0)));
  }

  /**
   * Delete a notification
   */
  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.api.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
  }
}

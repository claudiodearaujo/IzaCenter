import { Component, inject, signal, computed, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { TranslateModule } from '@ngx-translate/core';
import { InAppNotificationsService, InAppNotification } from '../../../core/services/inapp-notifications.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, BadgeModule, TranslateModule],
  templateUrl: './notification-bell.component.html',
  styleUrl: './notification-bell.component.css',
})
export class NotificationBellComponent implements OnInit {
  private notificationsService = inject(InAppNotificationsService);
  private authService = inject(AuthService);

  isOpen = signal(false);
  notifications = signal<InAppNotification[]>([]);
  loading = signal(false);

  readonly unreadCount = this.notificationsService.unreadCount;
  readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    if (this.isAuthenticated()) {
      this.loadNotifications();
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-notification-bell')) {
      this.isOpen.set(false);
    }
  }

  loadNotifications(): void {
    if (!this.isAuthenticated()) return;
    this.loading.set(true);
    this.notificationsService.list().subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  markRead(notification: InAppNotification, event: Event): void {
    event.stopPropagation();
    if (notification.isRead) return;
    this.notificationsService.markRead(notification.id).subscribe(() => {
      this.notifications.update((items) =>
        items.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
    });
  }

  markAllRead(): void {
    this.notificationsService.markAllRead().subscribe(() => {
      this.notifications.update((items) => items.map((n) => ({ ...n, isRead: true })));
    });
  }

  removeNotification(id: string, event: Event): void {
    event.stopPropagation();
    this.notificationsService.delete(id).subscribe(() => {
      this.notifications.update((items) => items.filter((n) => n.id !== id));
    });
  }
}

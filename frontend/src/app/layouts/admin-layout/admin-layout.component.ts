import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
    BadgeModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);

  isSidebarOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  menuItems = [
    { labelKey: 'admin.menu.dashboard', icon: 'pi-chart-bar', route: '/admin' },
    { labelKey: 'admin.layout.pendingReadings', icon: 'pi-book', route: '/admin/leituras', badge: true },
    { labelKey: 'admin.menu.appointments', icon: 'pi-calendar', route: '/admin/agendamentos' },
    { labelKey: 'admin.layout.orders', icon: 'pi-shopping-cart', route: '/admin/pedidos' },
    { labelKey: 'admin.menu.products', icon: 'pi-box', route: '/admin/produtos' },
    { labelKey: 'admin.layout.clients', icon: 'pi-users', route: '/admin/clientes' },
    { labelKey: 'admin.layout.availability', icon: 'pi-clock', route: '/admin/disponibilidade' },
    { labelKey: 'admin.layout.reports', icon: 'pi-chart-line', route: '/admin/relatorios' }
  ];

  toggleSidebar(): void {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}

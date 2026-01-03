import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
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
    BadgeModule
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
    { label: 'Dashboard', icon: 'pi-chart-bar', route: '/admin' },
    { label: 'Leituras Pendentes', icon: 'pi-book', route: '/admin/leituras', badge: true },
    { label: 'Agendamentos', icon: 'pi-calendar', route: '/admin/agendamentos' },
    { label: 'Pedidos', icon: 'pi-shopping-cart', route: '/admin/pedidos' },
    { label: 'Produtos', icon: 'pi-box', route: '/admin/produtos' },
    { label: 'Clientes', icon: 'pi-users', route: '/admin/clientes' },
    { label: 'Disponibilidade', icon: 'pi-clock', route: '/admin/disponibilidade' },
    { label: 'Relatórios', icon: 'pi-chart-line', route: '/admin/relatorios' }
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

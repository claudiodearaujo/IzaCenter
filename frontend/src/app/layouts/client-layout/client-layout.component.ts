import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './client-layout.component.html',
  styleUrl: './client-layout.component.css'
})
export class ClientLayoutComponent {
  private authService = inject(AuthService);

  isSidebarOpen = signal(false);
  readonly currentUser = this.authService.currentUser;

  menuItems = [
    { label: 'Painel', icon: 'pi-home', route: '/cliente' },
    { label: 'Minhas Leituras', icon: 'pi-book', route: '/cliente/leituras' },
    { label: 'Agendamentos', icon: 'pi-calendar', route: '/cliente/agendamentos' },
    { label: 'Histórico de Pedidos', icon: 'pi-shopping-bag', route: '/cliente/pedidos' },
    { label: 'Meu Perfil', icon: 'pi-user', route: '/cliente/perfil' }
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

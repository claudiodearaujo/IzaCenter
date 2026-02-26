import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ToastModule,
    TranslateModule
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
    { labelKey: 'client.menu.dashboard', icon: 'pi-home', route: '/cliente' },
    { labelKey: 'client.menu.readings', icon: 'pi-book', route: '/cliente/leituras' },
    { labelKey: 'client.menu.schedule', icon: 'pi-calendar-plus', route: '/cliente/agendar' },
    { labelKey: 'client.menu.appointments', icon: 'pi-calendar', route: '/cliente/agendamentos' },
    { labelKey: 'client.menu.orders', icon: 'pi-shopping-bag', route: '/cliente/pedidos' },
    { labelKey: 'client.menu.profile', icon: 'pi-user', route: '/cliente/perfil' }
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

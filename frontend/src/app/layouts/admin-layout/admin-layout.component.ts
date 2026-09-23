import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { PublicSettingsStore } from '../../core/services/public-settings.store';

interface AdminMenuItem {
  labelKey: string;
  icon: string;
  route: string;
  badge?: boolean;
  moduleKey?: string;
}

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
export class AdminLayoutComponent implements OnInit {
  private authService = inject(AuthService);
  private publicSettingsStore = inject(PublicSettingsStore);

  isSidebarOpen = signal(false);
  enabledModules = signal<string[]>([]);
  readonly currentUser = this.authService.currentUser;

  menuItems: AdminMenuItem[] = [
    { labelKey: 'admin.menu.dashboard', icon: 'pi-chart-bar', route: '/admin' },
    { labelKey: 'admin.layout.pendingReadings', icon: 'pi-book', route: '/admin/entregas', badge: true },
    { labelKey: 'admin.menu.appointments', icon: 'pi-calendar', route: '/admin/agendamentos' },
    { labelKey: 'admin.layout.orders', icon: 'pi-shopping-cart', route: '/admin/pedidos' },
    { labelKey: 'admin.menu.products', icon: 'pi-box', route: '/admin/produtos' },
    { labelKey: 'admin.menu.categories', icon: 'pi-th-large', route: '/admin/categorias' },
    { labelKey: 'admin.menu.cards', icon: 'pi-images', route: '/admin/cartas', moduleKey: 'tarot-cards' },
    { labelKey: 'admin.layout.clients', icon: 'pi-users', route: '/admin/usuarios' },
    { labelKey: 'admin.menu.testimonials', icon: 'pi-comments', route: '/admin/depoimentos' },
    { labelKey: 'admin.layout.availability', icon: 'pi-clock', route: '/admin/disponibilidade' },
    { labelKey: 'admin.layout.reports', icon: 'pi-chart-line', route: '/admin/relatorios' },
    { labelKey: 'admin.menu.billing', icon: 'pi-credit-card', route: '/admin/assinatura' },
    { labelKey: 'admin.menu.settings', icon: 'pi-cog', route: '/admin/configuracoes' }
  ];

  ngOnInit(): void {
    this.publicSettingsStore.load().subscribe((settings) => {
      this.enabledModules.set(settings.enabledModules);
    });
  }

  isMenuItemEnabled(item: AdminMenuItem): boolean {
    return !item.moduleKey || this.enabledModules().includes(item.moduleKey);
  }

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

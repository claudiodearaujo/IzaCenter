import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MenubarModule } from 'primeng/menubar';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageSelectorComponent } from '../language-selector/language-selector.component';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RouterLinkActive,
    ButtonModule,
    BadgeModule,
    MenubarModule,
    TranslateModule,
    LanguageSelectorComponent,
    NotificationBellComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  isMenuOpen = signal(false);
  isSearchOpen = signal(false);
  globalSearchTerm = signal('');

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly isAdmin = this.authService.isAdmin;
  readonly currentUser = this.authService.currentUser;
  readonly cartItemCount = this.cartService.itemCount;

  toggleMenu(): void {
    this.isMenuOpen.update(value => !value);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleSearch(): void {
    this.isSearchOpen.update(v => !v);
    if (!this.isSearchOpen()) {
      this.globalSearchTerm.set('');
    }
  }

  onGlobalSearch(): void {
    const term = this.globalSearchTerm().trim();
    if (term) {
      this.router.navigate(['/loja'], { queryParams: { search: term } });
      this.isSearchOpen.set(false);
      this.globalSearchTerm.set('');
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}

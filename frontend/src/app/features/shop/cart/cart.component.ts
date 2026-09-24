import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CartService, CartItem } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    InputTextModule,
    TextareaModule,
    CurrencyBrlPipe,
    TranslateModule,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);
  private api = inject(ApiService);

  couponCode = signal('');
  applyingCoupon = signal(false);
  appliedCoupon = signal<{ code: string; discountType: string; discountValue: number } | null>(null);

  readonly discountAmount = computed(() => {
    const coupon = this.appliedCoupon();
    if (!coupon) return 0;
    const subtotalValue = this.cartService.subtotal();
    if (coupon.discountType === 'PERCENTAGE') {
      return (subtotalValue * coupon.discountValue) / 100;
    }
    return Math.min(coupon.discountValue, subtotalValue);
  });

  readonly total = computed(() =>
    Math.max(0, this.cartService.subtotal() - this.discountAmount())
  );

  get items() { return this.cartService.items; }
  get subtotal() { return this.cartService.subtotal; }
  get isEmpty() { return this.cartService.itemCount() === 0; }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity < 1) return;
    this.cartService.updateQuantity(item.product.id, quantity);
  }

  updateQuestions(item: CartItem, questions: string): void {
    this.cartService.updateQuestions(item.product.id, questions ? [questions] : []);
  }

  removeItem(productId: string): void {
    this.cartService.removeItem(productId);
    this.notification.info(this.translate.instant('shop.cart.itemRemoved'));
  }

  clearCart(): void {
    this.cartService.clearCart();
    this.notification.info(this.translate.instant('shop.cart.cartCleared'));
  }

  applyCoupon(): void {
    if (!this.couponCode()) return;
    if (!this.authService.isAuthenticated()) {
      this.notification.info(this.translate.instant('shop.cart.loginToContinue'));
      return;
    }

    this.applyingCoupon.set(true);

    this.api.post<{ data: { code: string; discountType: string; discountValue: number; valid: boolean } }>(
      '/orders/coupon/validate',
      { code: this.couponCode(), orderTotal: this.cartService.subtotal() }
    ).subscribe({
      next: (response) => {
        this.appliedCoupon.set(response.data);
        this.applyingCoupon.set(false);
        this.notification.success(this.translate.instant('shop.cart.couponApplied'));
      },
      error: (err) => {
        this.applyingCoupon.set(false);
        this.notification.error(err.error?.message || this.translate.instant('shop.cart.couponInvalid'));
      },
    });
  }

  removeCoupon(): void {
    this.appliedCoupon.set(null);
    this.couponCode.set('');
  }

  proceedToCheckout(): void {
    if (!this.authService.isAuthenticated()) {
      this.notification.info(this.translate.instant('shop.cart.loginToContinue'));
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: '/checkout' },
      });
      return;
    }

    this.router.navigate(['/checkout']);
  }

  getServiceKindLabel(kind: string): string {
    const labels: Record<string, string> = {
      SERVICE: 'Serviço',
      SESSION: 'Sessão',
      PACKAGE: 'Pacote',
      ASYNC_SERVICE: 'Serviço assíncrono',
      DIGITAL_PRODUCT: 'Produto digital',
    };
    return labels[kind] || kind;
  }
}

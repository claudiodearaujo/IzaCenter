// apps/frontend/src/app/features/shop/cart/cart.component.ts

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Textarea, TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';

import { CartService, CartItem } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    CurrencyBrlPipe,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notification = inject(NotificationService);

  couponCode = signal('');
  applyingCoupon = signal(false);

  get items() {
    return this.cartService.items;
  }

  get subtotal() {
    return this.cartService.subtotal;
  }

  get total() {
    return this.cartService.total;
  }

  get isEmpty() {
    return this.cartService.itemCount() === 0;
  }

  updateQuantity(item: CartItem, quantity: number) {
    if (quantity < 1) return;
    this.cartService.updateQuantity(item.productId, quantity);
  }

  updateQuestions(item: CartItem, questions: string) {
    this.cartService.updateQuestions(item.productId, questions ? [questions] : []);
  }

  removeItem(productId: string) {
    this.cartService.removeItem(productId);
    this.notification.info('Item removido do carrinho');
  }

  clearCart() {
    this.cartService.clearCart();
    this.notification.info('Carrinho limpo');
  }

  applyCoupon() {
    if (!this.couponCode()) return;
    
    this.applyingCoupon.set(true);
    
    // TODO: Validate coupon via API
    setTimeout(() => {
      this.applyingCoupon.set(false);
      this.notification.info('Cupom aplicado! (Demo)');
    }, 1000);
  }

  proceedToCheckout() {
    if (!this.authService.isAuthenticated()) {
      this.notification.info('Faça login para continuar com a compra');
      this.router.navigate(['/auth/login'], { 
        queryParams: { redirect: '/loja/checkout' } 
      });
      return;
    }

    this.router.navigate(['/loja/checkout']);
  }

  getProductTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'QUESTION': 'Perguntas',
      'SESSION': 'Sessão',
      'MONTHLY': 'Mensal',
      'SPECIAL': 'Especial',
    };
    return labels[type] || type;
  }
}

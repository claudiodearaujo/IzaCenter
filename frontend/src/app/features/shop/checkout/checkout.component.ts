// apps/frontend/src/app/features/shop/checkout/checkout.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CurrencyBrlPipe } from '../../../shared/pipes/currency-brl.pipe';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    CheckboxModule,
    ProgressSpinnerModule,
    CurrencyBrlPipe,
    TranslateModule,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  user = this.authService.user;
  processing = signal(false);
  acceptTerms = signal(false);
  showCancelledBanner = signal(false);

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

  ngOnInit() {
    // Sprint 1.1 — Feedback pós-pagamento cancelado
    const cancelled = this.route.snapshot.queryParamMap.get('cancelled');
    if (cancelled === 'true') {
      this.showCancelledBanner.set(true);
    }

    // Redirect if cart is empty
    if (this.isEmpty) {
      this.router.navigate(['/loja']);
    }

    // Redirect if not authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { redirect: '/loja/checkout' },
      });
    }
  }

  async processPayment() {
    if (!this.acceptTerms()) {
      this.notification.warning(this.translate.instant('shop.checkout.acceptTermsWarning'));
      return;
    }

    if (this.isEmpty) {
      this.notification.error(this.translate.instant('shop.checkout.emptyCart'));
      return;
    }

    this.processing.set(true);

    const orderData = {
      items: this.cartService.getItemsForCheckout(),
    };

    this.api.post<{ data: { checkoutUrl: string } }>('/orders', orderData).subscribe({
      next: (response) => {
        // Redirect to Stripe checkout
        if (response.data.checkoutUrl) {
          this.cartService.clearCart();
          window.location.href = response.data.checkoutUrl;
        }
      },
      error: (error) => {
        this.processing.set(false);
        this.notification.error(
          error.error?.message || this.translate.instant('shop.checkout.processingError')
        );
      },
    });
  }

  getProductTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'QUESTION': this.translate.instant('shop.checkout.typeQuestion'),
      'SESSION': this.translate.instant('shop.checkout.typeSession'),
      'MONTHLY': this.translate.instant('shop.checkout.typeMonthly'),
      'SPECIAL': this.translate.instant('shop.checkout.typeSpecial'),
    };
    return labels[type] || type;
  }
}

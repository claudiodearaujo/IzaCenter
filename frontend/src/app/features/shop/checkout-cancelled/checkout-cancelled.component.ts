// apps/frontend/src/app/features/shop/checkout-cancelled/checkout-cancelled.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-checkout-cancelled',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslateModule,
    ButtonModule,
  ],
  templateUrl: './checkout-cancelled.component.html',
  styleUrl: './checkout-cancelled.component.css',
})
export class CheckoutCancelledComponent {}

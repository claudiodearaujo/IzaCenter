import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-checkout-cancelled',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './checkout-cancelled.component.html',
  styleUrl: './checkout-cancelled.component.css',
})
export class CheckoutCancelledComponent {}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import {
  DsButtonComponent,
  DsFormFieldComponent,
} from '../../../shared/design-system';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    TranslateModule,
    DsButtonComponent,
    DsFormFieldComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);

  isLoading = signal(false);
  emailSent = signal(false);
  email = '';

  onSubmit(): void {
    this.isLoading.set(true);
    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        this.emailSent.set(true);
        this.isLoading.set(false);
      },
      error: () => {
        this.emailSent.set(true);
        this.isLoading.set(false);
      },
    });
  }
}

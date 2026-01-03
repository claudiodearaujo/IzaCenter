import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

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
      }
    });
  }
}

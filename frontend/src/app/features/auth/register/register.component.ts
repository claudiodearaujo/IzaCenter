import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { InputMaskModule } from 'primeng/inputmask';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, InputMaskModule, TranslateModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  form = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

  async onSubmit(): Promise<void> {
    if (this.form.password !== this.form.confirmPassword) {
      this.notificationService.showError(this.translate.instant('auth.messages.passwordMismatch'));
      return;
    }

    this.isLoading.set(true);
    
    this.authService.register({
      fullName: this.form.fullName,
      email: this.form.email,
      phone: this.form.phone,
      password: this.form.password
    }).subscribe({
      next: () => {
        this.notificationService.showSuccess(this.translate.instant('auth.messages.registerSuccess'));
        this.router.navigate(['/cliente']);
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || this.translate.instant('auth.messages.registerError'));
        this.isLoading.set(false);
      }
    });
  }
}

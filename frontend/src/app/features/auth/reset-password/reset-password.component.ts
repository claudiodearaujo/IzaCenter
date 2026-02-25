import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, PasswordModule, TranslateModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  success = signal(false);
  token = '';
  form = { password: '', confirmPassword: '' };

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  onSubmit(): void {
    if (this.form.password !== this.form.confirmPassword) {
      this.notificationService.showError(this.translate.instant('auth.messages.passwordMismatch'));
      return;
    }

    this.isLoading.set(true);
    this.authService.resetPassword(this.token, this.form.password).subscribe({
      next: () => {
        this.success.set(true);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || this.translate.instant('auth.messages.invalidResetToken'));
        this.isLoading.set(false);
      }
    });
  }
}

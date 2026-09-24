import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import {
  DsButtonComponent,
  DsFormFieldComponent,
} from '../../../shared/design-system';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    InputTextModule,
    PasswordModule,
    TranslateModule,
    DsButtonComponent,
    DsFormFieldComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  isLoading = signal(false);
  form = { email: '', password: '' };

  onSubmit(): void {
    this.isLoading.set(true);

    this.authService.login(this.form).subscribe({
      next: (response) => {
        this.notificationService.showSuccess(
          this.translate.instant('auth.messages.loginSuccess')
        );

        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//')) {
          this.router.navigateByUrl(redirect);
          return;
        }

        const user = response.data.user;
        this.router.navigate([user.role === 'ADMIN' ? '/admin' : '/cliente']);
      },
      error: (error) => {
        this.notificationService.showError(
          error.error?.message ||
            this.translate.instant('auth.messages.loginError')
        );
        this.isLoading.set(false);
      },
    });
  }
}

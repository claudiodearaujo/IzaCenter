import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  isLoading = signal(false);
  form = { email: '', password: '' };

  async onSubmit(): Promise<void> {
    this.isLoading.set(true);
    
    this.authService.login(this.form).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Login realizado com sucesso!');
        const user = response.data.user;
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/cliente']);
        }
      },
      error: (error) => {
        this.notificationService.showError(error.error?.message || 'Erro ao fazer login');
        this.isLoading.set(false);
      }
    });
  }
}

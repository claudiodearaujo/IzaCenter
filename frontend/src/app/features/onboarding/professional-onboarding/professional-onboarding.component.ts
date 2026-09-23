import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';
import { BrandingService } from '../../../core/services/branding.service';
import {
  OnboardingService,
  ProfessionalOnboardingRequest,
} from '../../../core/services/onboarding.service';
import { NotificationService } from '../../../core/services/notification.service';
import { PublicSettingsStore } from '../../../core/services/public-settings.store';
import { TenantContextService } from '../../../core/services/tenant-context.service';

@Component({
  selector: 'app-professional-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
  ],
  templateUrl: './professional-onboarding.component.html',
  styleUrl: './professional-onboarding.component.css',
})
export class ProfessionalOnboardingComponent {
  private onboardingService = inject(OnboardingService);
  private authService = inject(AuthService);
  private tenantContext = inject(TenantContextService);
  private publicSettings = inject(PublicSettingsStore);
  private branding = inject(BrandingService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  step = signal(1);
  isLoading = signal(false);
  slugTouched = signal(false);

  form: ProfessionalOnboardingRequest & { confirmPassword: string } = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tenantName: '',
    tenantSlug: '',
    professionalTitle: '',
    serviceMode: 'ONLINE',
    contactEmail: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#7C3AED',
    accentColor: '#0EA5E9',
  };

  next(): void {
    if (!this.validateStep(this.step())) return;
    this.step.update((value) => Math.min(4, value + 1));
  }

  previous(): void {
    this.step.update((value) => Math.max(1, value - 1));
  }

  onTenantNameChange(): void {
    if (!this.slugTouched()) {
      this.form.tenantSlug = this.slugify(this.form.tenantName);
    }
  }

  onSlugChange(): void {
    this.slugTouched.set(true);
    this.form.tenantSlug = this.slugify(this.form.tenantSlug);
  }

  submit(): void {
    if (!this.validateStep(4)) return;

    const { confirmPassword: _confirmPassword, ...payload } = this.form;
    this.isLoading.set(true);

    this.onboardingService.createProfessional(payload).subscribe({
      next: (response) => {
        const { tenant, membership, user, accessToken } = response.data;

        this.tenantContext.selectTenant(tenant);
        this.authService.establishSession({ user, membership, accessToken });

        this.publicSettings.refresh().subscribe({
          next: (settings) => {
            this.branding.apply(settings.branding);
            this.notification.showSuccess('Seu espaço profissional foi criado com sucesso.');
            this.router.navigate(['/admin']);
          },
          error: () => {
            this.notification.showSuccess('Seu espaço profissional foi criado com sucesso.');
            this.router.navigate(['/admin']);
          },
        });
      },
      error: (error) => {
        this.notification.showError(
          error.error?.message || 'Não foi possível criar seu espaço profissional.'
        );
        this.isLoading.set(false);
      },
    });
  }

  private validateStep(step: number): boolean {
    if (step === 1) {
      if (!this.form.fullName.trim() || !this.form.email.trim() || !this.form.password) {
        this.notification.showError('Preencha nome, e-mail e senha.');
        return false;
      }

      if (this.form.password !== this.form.confirmPassword) {
        this.notification.showError('As senhas não conferem.');
        return false;
      }
    }

    if (step === 2) {
      if (!this.form.tenantName.trim() || this.form.tenantSlug.length < 3) {
        this.notification.showError('Informe o nome e um identificador válido para o espaço.');
        return false;
      }
    }

    if (step === 3 && !this.form.professionalTitle.trim()) {
      this.notification.showError('Informe seu título profissional.');
      return false;
    }

    return true;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48);
  }
}

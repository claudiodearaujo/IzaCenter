// apps/frontend/src/app/features/client/profile/profile.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DividerModule } from 'primeng/divider';

import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FileUploadModule,
    DividerModule,
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private api = inject(ApiService);
  authService = inject(AuthService);
  private notification = inject(NotificationService);
  private translate = inject(TranslateService);

  user = this.authService.user;

  // Profile form
  profileForm = {
    fullName: '',
    phone: '',
    birthDate: '',
  };
  savingProfile = signal(false);

  // Password form
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  savingPassword = signal(false);

  // Avatar
  uploadingAvatar = signal(false);

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    const currentUser = this.user();
    if (currentUser) {
      this.profileForm = {
        fullName: currentUser.fullName || '',
        phone: currentUser.phone || '',
        birthDate: currentUser.birthDate
          ? new Date(currentUser.birthDate).toISOString().split('T')[0]
          : '',
      };
    }
  }

  saveProfile() {
    if (!this.profileForm.fullName.trim()) {
      this.notification.warning(this.translate.instant('client.profile.fullName') + ' ' + this.translate.instant('client.profile.required'));
      return;
    }

    this.savingProfile.set(true);

    this.api.patch('/users/me', this.profileForm).subscribe({
      next: () => {
        this.notification.success(this.translate.instant('client.profile.profileUpdated'));
        this.authService.refreshProfile();
        this.savingProfile.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || this.translate.instant('client.profile.profileError'));
        this.savingProfile.set(false);
      },
    });
  }

  changePassword() {
    if (
      !this.passwordForm.currentPassword ||
      !this.passwordForm.newPassword ||
      !this.passwordForm.confirmPassword
    ) {
      this.notification.warning(this.translate.instant('client.profile.fillAllFields'));
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.notification.error(this.translate.instant('client.profile.passwordMismatch'));
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.notification.error(this.translate.instant('client.profile.passwordMinLength'));
      return;
    }

    this.savingPassword.set(true);

    this.api
      .post('/auth/change-password', {
        currentPassword: this.passwordForm.currentPassword,
        newPassword: this.passwordForm.newPassword,
      })
      .subscribe({
        next: () => {
          this.notification.success(this.translate.instant('client.profile.passwordChanged'));
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          this.savingPassword.set(false);
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translate.instant('client.profile.passwordError'));
          this.savingPassword.set(false);
        },
      });
  }

  onAvatarUpload(event: FileUploadHandlerEvent) {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      const formData = new FormData();
      formData.append('avatar', file);

      this.uploadingAvatar.set(true);

      this.api.post('/users/me/avatar', formData).subscribe({
        next: () => {
          this.notification.success(this.translate.instant('client.profile.avatarUpdated'));
          this.authService.refreshProfile();
          this.uploadingAvatar.set(false);
        },
        error: (err) => {
          this.notification.error(err.error?.message || this.translate.instant('client.profile.avatarError'));
          this.uploadingAvatar.set(false);
        },
      });
    }
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return this.translate.instant('client.profile.notInformed');
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

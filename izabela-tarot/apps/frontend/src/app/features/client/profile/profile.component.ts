// apps/frontend/src/app/features/client/profile/profile.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
      this.notification.warning('Nome completo é obrigatório');
      return;
    }

    this.savingProfile.set(true);

    this.api.patch('/users/me', this.profileForm).subscribe({
      next: () => {
        this.notification.success('Perfil atualizado com sucesso!');
        this.authService.refreshProfile();
        this.savingProfile.set(false);
      },
      error: (err) => {
        this.notification.error(err.error?.message || 'Erro ao atualizar perfil');
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
      this.notification.warning('Preencha todos os campos');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.notification.error('As senhas não conferem');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      this.notification.error('A nova senha deve ter pelo menos 6 caracteres');
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
          this.notification.success('Senha alterada com sucesso!');
          this.passwordForm = {
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          };
          this.savingPassword.set(false);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao alterar senha');
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
          this.notification.success('Avatar atualizado!');
          this.authService.refreshProfile();
          this.uploadingAvatar.set(false);
        },
        error: (err) => {
          this.notification.error(err.error?.message || 'Erro ao enviar avatar');
          this.uploadingAvatar.set(false);
        },
      });
    }
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'Não informada';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

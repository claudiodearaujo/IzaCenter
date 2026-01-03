// apps/frontend/src/app/features/admin/users/user-detail/user-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Tabs } from 'primeng/tabs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { UsersService, User } from '../../../../core/services/users.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CurrencyBrlPipe } from '../../../../shared/pipes/currency-brl.pipe';

interface UserDetail extends User {
  orders?: any[];
  readings?: any[];
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    SkeletonModule,
    TagModule,
    Tabs,
    ToggleButtonModule,
    ConfirmDialogModule,
    CurrencyBrlPipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.css',
})
export class UserDetailComponent implements OnInit {
  private usersService = inject(UsersService);
  private route = inject(ActivatedRoute);
  private notification = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  user = signal<UserDetail | null>(null);
  loading = signal(true);
  saving = signal(false);

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    }
  }

  loadUser(id: string) {
    this.loading.set(true);

    this.usersService.findById(id).subscribe({
      next: (response) => {
        this.user.set(response.data as UserDetail);
        this.loading.set(false);
      },
      error: () => {
        this.notification.error('Erro ao carregar usuário');
        this.loading.set(false);
      },
    });
  }

  toggleRole() {
    if (!this.user()) return;

    const newRole = this.user()!.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';

    this.confirmationService.confirm({
      message: `Tem certeza que deseja alterar o tipo do usuário para ${
        newRole === 'ADMIN' ? 'Administrador' : 'Cliente'
      }?`,
      header: 'Confirmar Alteração',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.updateRole(this.user()!.id, newRole).subscribe({
          next: () => {
            this.user.update((u) => (u ? { ...u, role: newRole as 'ADMIN' | 'CLIENT' } : null));
            this.notification.success('Tipo de usuário atualizado');
          },
          error: () => {
            this.notification.error('Erro ao atualizar tipo');
          },
        });
      },
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return role === 'ADMIN' ? 'warn' : 'info';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrador' : 'Cliente';
  }

  formatDate(dateString?: string | Date): string {
    if (!dateString) return 'Não informada';
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  formatDateTime(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

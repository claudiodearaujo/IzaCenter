// apps/frontend/src/app/features/admin/users/user-detail/user-detail.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primeng/tabs';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    ToggleButtonModule,
    ConfirmDialogModule,
    CurrencyBrlPipe,
    TranslateModule,
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
  private translate = inject(TranslateService);

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
        this.notification.error(this.translate.instant('admin.users.errorLoadingUser'));
        this.loading.set(false);
      },
    });
  }

  toggleRole() {
    if (!this.user()) return;

    const newRole = this.user()!.role === 'ADMIN' ? 'CLIENT' : 'ADMIN';

    const roleLabel = newRole === 'ADMIN'
      ? this.translate.instant('admin.users.roleAdmin')
      : this.translate.instant('admin.users.roleClient');

    this.confirmationService.confirm({
      message: this.translate.instant('admin.users.confirmRoleChange', { role: roleLabel }),
      header: this.translate.instant('admin.users.confirmChange'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.updateRole(this.user()!.id, newRole).subscribe({
          next: () => {
            this.user.update((u) => (u ? { ...u, role: newRole as 'ADMIN' | 'CLIENT' } : null));
            this.notification.success(this.translate.instant('admin.users.roleUpdated'));
          },
          error: () => {
            this.notification.error(this.translate.instant('admin.users.errorUpdatingRole'));
          },
        });
      },
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return role === 'ADMIN' ? 'warn' : 'info';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN'
      ? this.translate.instant('admin.users.roleAdmin')
      : this.translate.instant('admin.users.roleClient');
  }

  formatDate(dateString?: string | Date): string {
    if (!dateString) return this.translate.instant('admin.users.notInformed');
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

  toggleActive() {
    if (!this.user()) return;

    const newStatus = !this.user()!.isActive;

    const action = newStatus
      ? this.translate.instant('admin.users.activate')
      : this.translate.instant('admin.users.deactivate');
    const successMessage = newStatus
      ? this.translate.instant('admin.users.userActivated')
      : this.translate.instant('admin.users.userDeactivated');

    this.confirmationService.confirm({
      message: this.translate.instant('admin.users.confirmStatusChange', { action }),
      header: this.translate.instant('admin.users.confirmChange'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.update(this.user()!.id, { isActive: newStatus } as any).subscribe({
          next: () => {
            this.user.update((u) => (u ? { ...u, isActive: newStatus } : null));
            this.notification.success(successMessage);
          },
          error: () => {
            this.notification.error(this.translate.instant('admin.users.errorUpdatingStatus'));
          },
        });
      },
    });
  }
}

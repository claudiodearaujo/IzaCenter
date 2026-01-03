// apps/frontend/src/app/features/admin/users/user-list/user-list.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Select } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { UsersService, User } from '../../../../core/services/users.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    Select,
    TagModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.css',
})
export class UserListComponent implements OnInit {
  private usersService = inject(UsersService);

  users = signal<User[]>([]);
  loading = signal(true);
  totalRecords = signal(0);

  searchTerm = '';
  selectedRole: string | null = null;

  roleOptions = [
    { label: 'Todos', value: null },
    { label: 'Clientes', value: 'CLIENT' },
    { label: 'Administradores', value: 'ADMIN' },
  ];

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers(event?: any) {
    this.loading.set(true);

    const params: any = {
      page: event?.first ? Math.floor(event.first / (event.rows || 10)) + 1 : 1,
      limit: event?.rows || 10,
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }

    if (this.selectedRole) {
      params.role = this.selectedRole;
    }

    this.usersService.findAll(params).subscribe({
      next: (response) => {
        this.users.set(response.data);
        this.totalRecords.set(response.meta.total);
        this.loading.set(false);
      },
      error: () => {
        this.users.set([]);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadUsers();
  }

  onRoleChange() {
    this.loadUsers();
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    return role === 'ADMIN' ? 'warn' : 'info';
  }

  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Admin' : 'Cliente';
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
}

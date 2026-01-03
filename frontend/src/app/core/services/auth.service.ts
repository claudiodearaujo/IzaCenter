import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private accessTokenSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly user = this.currentUser; // Alias for backward compatibility
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => this.currentUserSignal()?.role === 'ADMIN');

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const user = this.storage.get<User>('user');
    const token = this.storage.get<string>('accessToken');
    
    if (user && token) {
      this.currentUserSignal.set(user);
      this.accessTokenSignal.set(token);
    }
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap(response => {
        this.currentUserSignal.set(response.data.user);
        this.accessTokenSignal.set(response.data.accessToken);
        this.storage.set('user', response.data.user);
        this.storage.set('accessToken', response.data.accessToken);
      })
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => {
        this.currentUserSignal.set(response.data.user);
        this.accessTokenSignal.set(response.data.accessToken);
        this.storage.set('user', response.data.user);
        this.storage.set('accessToken', response.data.accessToken);
      })
    );
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.api.post('/auth/reset-password', { token, password });
  }

  refreshToken(): Observable<{ data: { accessToken: string } } | null> {
    return this.api.post<{ data: { accessToken: string } }>('/auth/refresh-token', {}).pipe(
      tap(response => {
        if (response?.data?.accessToken) {
          this.accessTokenSignal.set(response.data.accessToken);
          this.storage.set('accessToken', response.data.accessToken);
        }
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe();
    this.currentUserSignal.set(null);
    this.accessTokenSignal.set(null);
    this.storage.remove('user');
    this.storage.remove('accessToken');
    this.router.navigate(['/']);
  }

  updateUserProfile(user: Partial<User>): void {
    const currentUser = this.currentUserSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      this.currentUserSignal.set(updatedUser);
      this.storage.set('user', updatedUser);
    }
  }

  refreshProfile(): void {
    this.api.get<{ data: User }>('/users/me').subscribe({
      next: (response) => {
        if (response.data) {
          this.currentUserSignal.set(response.data);
          this.storage.set('user', response.data);
        }
      },
      error: () => {
        // Ignore errors silently
      }
    });
  }
}

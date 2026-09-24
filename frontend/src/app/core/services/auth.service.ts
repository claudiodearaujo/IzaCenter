import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, firstValueFrom, shareReplay, finalize, defer, from } from 'rxjs';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { User } from '../models/user.model';
import { TenantMembership } from '../models/tenant.model';

interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    membership: TenantMembership;
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
  private currentMembershipSignal = signal<TenantMembership | null>(null);
  private accessTokenSignal = signal<string | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly currentMembership = this.currentMembershipSignal.asReadonly();
  readonly user = this.currentUser; // Alias for backward compatibility
  readonly isAuthenticated = computed(() => !!this.currentUserSignal());
  readonly isAdmin = computed(() => {
    const role = this.currentMembershipSignal()?.role;
    return role === 'OWNER' || role === 'ADMIN';
  });

  constructor() {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    // Remove legacy bearer credentials. Refresh is now HttpOnly; access stays in memory.
    this.storage.remove('accessToken');
    this.storage.remove('user');
    this.storage.remove('tenantMembership');
  }

  async restoreSession(): Promise<void> {
    await firstValueFrom(this.refreshToken());
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  establishSession(data: {
    user: User;
    membership: TenantMembership;
    accessToken: string;
  }): void {
    this.currentUserSignal.set(data.user);
    this.currentMembershipSignal.set(data.membership);
    this.accessTokenSignal.set(data.accessToken);

  }

  login(data: LoginData): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/login', data).pipe(
      tap(response => {
        this.establishSession(response.data);
      })
    );
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.api.post<AuthResponse>('/auth/register', data).pipe(
      tap(response => {
        this.establishSession(response.data);
      })
    );
  }

  forgotPassword(email: string): Observable<{ success: boolean; message: string }> {
    return this.api.post('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<{ success: boolean; message: string }> {
    return this.api.post('/auth/reset-password', { token, password });
  }

  private refreshing?: Observable<AuthResponse | null>;

  refreshToken(): Observable<AuthResponse | null> {
    if (!this.refreshing) {
      const request = () => firstValueFrom(this.api.post<AuthResponse>('/auth/refresh', {}));
      this.refreshing = defer(() => from(
        typeof navigator !== 'undefined' && navigator.locks
          ? navigator.locks.request('therapist-session-refresh', request)
          : request()
      )).pipe(
        tap(response => this.establishSession(response.data)),
        catchError(() => { this.clearSession(); return of(null); }),
        finalize(() => { this.refreshing = undefined; }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.refreshing;
  }

  clearSession(): void {
    this.currentUserSignal.set(null);
    this.currentMembershipSignal.set(null);
    this.accessTokenSignal.set(null);
    this.loadStoredUser();
  }

  logout(): void {
    this.api.post('/auth/logout', {}).subscribe({ error: () => {} });
    this.currentUserSignal.set(null);
    this.currentMembershipSignal.set(null);
    this.accessTokenSignal.set(null);
    this.storage.remove('user');
    this.storage.remove('tenantMembership');
    this.storage.remove('accessToken');
    this.router.navigate(['/']);
  }

  updateUserProfile(user: Partial<User>): void {
    const currentUser = this.currentUserSignal();
    if (currentUser) {
      const updatedUser = { ...currentUser, ...user };
      this.currentUserSignal.set(updatedUser);

    }
  }

  refreshProfile(): void {
    this.api.get<{ data: User }>('/users/me').subscribe({
      next: (response) => {
        if (response.data) {
          this.currentUserSignal.set(response.data);
        }
      },
      error: () => {
        // Ignore errors silently
      }
    });
  }
}

import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Never attach credentials to third-party URLs or translation assets.
  const base = environment.apiUrl.replace(/\/$/, '');
  if (!(req.url === base || req.url.startsWith(`${base}/`))) return next(req);
  const auth = inject(AuthService);
  const token = auth.getAccessToken();
  const authorized = req.clone({
    withCredentials: true,
    setHeaders: { 'X-Requested-With': 'XMLHttpRequest', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  return next(authorized).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status !== 401 || !token || req.url.includes('/auth/')) return throwError(() => error);
    return auth.refreshToken().pipe(switchMap(response => {
      if (!response) return throwError(() => error);
      return next(authorized.clone({ setHeaders: { Authorization: `Bearer ${response.data.accessToken}` } }));
    }));
  }));
};

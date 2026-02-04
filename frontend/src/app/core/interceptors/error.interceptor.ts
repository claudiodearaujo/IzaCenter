import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);
  const translateService = inject(TranslateService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = translateService.instant('error.interceptor.unexpectedError');

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = translateService.instant('error.interceptor.sessionExpired');
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = translateService.instant('error.interceptor.unauthorized');
            break;
          case 404:
            errorMessage = translateService.instant('error.interceptor.notFound');
            break;
          case 422:
            errorMessage = error.error?.message || translateService.instant('error.interceptor.invalidData');
            break;
          case 500:
            errorMessage = translateService.instant('error.interceptor.serverError');
            break;
          default:
            errorMessage = error.error?.message || error.error?.error || errorMessage;
        }
      }

      notificationService.showError(errorMessage);
      return throwError(() => error);
    })
  );
};

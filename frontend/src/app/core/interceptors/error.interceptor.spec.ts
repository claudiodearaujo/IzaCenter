import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

describe('errorInterceptor public navigation', () => {
  let router: jasmine.SpyObj<Router>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let authService: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    notificationService = jasmine.createSpyObj<NotificationService>('NotificationService', ['showError']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['getAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuthService, useValue: authService },
      ],
    });
  });

  function execute401(url = '/api/products/public/featured'): void {
    const request = new HttpRequest('GET', url);
    const next: HttpHandlerFn = () =>
      throwError(() => new HttpErrorResponse({
        status: 401,
        url,
        error: { message: 'Não autorizado' },
      }));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, next).subscribe({
        error: () => undefined,
      });
    });
  }

  it('should not redirect an anonymous visitor to login on a public 401', () => {
    authService.getAccessToken.and.returnValue(null);

    execute401();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(notificationService.showError).toHaveBeenCalledWith('Não autorizado');
  });

  it('should redirect an authenticated session to login on 401', () => {
    authService.getAccessToken.and.returnValue('expired-token');

    execute401('/api/admin/settings');

    expect(router.navigate).toHaveBeenCalledOnceWith(['/auth/login']);
    expect(notificationService.showError).toHaveBeenCalledWith('Sessão expirada. Faça login novamente.');
  });
});

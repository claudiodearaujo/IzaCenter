import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';

      // Network/offline errors (status 0 = no connection)
      if (error.status === 0) {
        if (!navigator.onLine) {
          errorMessage = 'Sem conexão com a internet. Verifique sua rede e tente novamente.';
        } else {
          errorMessage = 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
        }
        notificationService.showError(errorMessage, 'Erro de Conexão');
        return throwError(() => error);
      }

      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = error.error.message;
      } else {
        // Server-side error
        switch (error.status) {
          case 401:
            errorMessage = 'Sessão expirada. Faça login novamente.';
            router.navigate(['/auth/login']);
            break;
          case 403:
            errorMessage = 'Você não tem permissão para acessar este recurso.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 422:
            errorMessage = error.error?.message || 'Dados inválidos.';
            break;
          case 429:
            errorMessage = 'Muitas requisições. Aguarde um momento e tente novamente.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          case 503:
            errorMessage = 'Serviço temporariamente indisponível. Tente novamente em instantes.';
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

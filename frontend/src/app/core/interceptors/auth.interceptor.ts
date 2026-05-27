import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Attaches the JWT Bearer token to every outgoing HTTP request automatically.
 * Catches 401 errors to trigger logout and redirect.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const injector = inject(Injector);

  // Lazy resolution prevents cyclic dependency crashes during bootstrap
  const getAuthService = () => injector.get(AuthService);
  const getNotifyService = () => injector.get(NotificationService);
  
  const token = getAuthService().getToken();

  let clonedReq = req;
  if (token) {
    clonedReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(clonedReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        // Clear session and redirect on unauthorized/expired token
        getAuthService().logout();
        getNotifyService().warning('Session expired or unauthorized. Please log in again.');
      }
      return throwError(() => error);
    })
  );
};

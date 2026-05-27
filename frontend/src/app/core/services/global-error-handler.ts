import { ErrorHandler, Injectable, NgZone, Injector, inject } from '@angular/core';
import { NotificationService } from './notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private zone = inject(NgZone);
  private injector = inject(Injector);

  handleError(error: unknown): void {
    console.error('[UNHANDLED ERROR]:', error);

    this.zone.run(() => {
      const message =
        error instanceof Error ? error.message : 'An unexpected client error occurred.';
      try {
        const notify = this.injector.get(NotificationService);
        notify.error(`Application error: ${message.slice(0, 80)}`);
      } catch {
        // Snackbar overlay may not be ready during early bootstrap failures
      }
    });

    // Rethrow to ensure bootstrapApplication promise rejects if this happens during boot
    throw error;
  }
}

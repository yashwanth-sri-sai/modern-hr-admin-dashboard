import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationOptions {
  action?: string;
  duration?: number;
  onAction?: () => void;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private snackBar = inject(MatSnackBar);

  private readonly icons: Record<NotificationType, string> = {
    success: '✔',
    error: '✖',
    warning: '⚠',
    info: 'ℹ',
  };

  private readonly defaultDuration: Record<NotificationType, number> = {
    success: 4000,
    error: 6000,
    warning: 5000,
    info: 4000,
  };

  success(message: string, options?: NotificationOptions): void {
    this.show('success', message, options);
  }

  error(message: string, options?: NotificationOptions): void {
    this.show('error', message, options);
  }

  warning(message: string, options?: NotificationOptions): void {
    this.show('warning', message, options);
  }

  info(message: string, options?: NotificationOptions): void {
    this.show('info', message, options);
  }

  show(type: NotificationType, message: string, options?: NotificationOptions): void {
    const action = options?.action ?? 'Dismiss';
    const config: MatSnackBarConfig = {
      duration: options?.duration ?? this.defaultDuration[type],
      panelClass: [`snack-${type}`, 'snack-premium'],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    };

    const ref = this.snackBar.open(`${this.icons[type]}  ${message}`, action, config);

    if (options?.onAction) {
      ref.onAction().subscribe(() => options.onAction?.());
    }
  }
}

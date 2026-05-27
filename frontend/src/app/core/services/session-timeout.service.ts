import { Injectable, inject, NgZone } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subscription, fromEvent, merge, throttleTime } from 'rxjs';
import { AuthService } from './auth.service';
import { TimeoutDialogComponent } from '../../shared/components/timeout-dialog/timeout-dialog.component';

@Injectable({ providedIn: 'root' })
export class SessionTimeoutService {
  private dialog = inject(MatDialog);
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  private activitySub?: Subscription;
  private timeoutTimer?: any;
  private warningTimer?: any;
  private dialogRef: MatDialogRef<TimeoutDialogComponent> | null = null;

  // Inactivity timeout: 5 minutes. Warn 1 minute before.
  private readonly TIMEOUT_MS = 5 * 60 * 1000;
  private readonly WARNING_MS = 1 * 60 * 1000;

  constructor() {
    // Monitoring starts when shell layout calls startMonitoring() after login
  }

  private initActivityTracker(): void {
    if (!this.authService.isAuthenticated()) {
      return;
    }

    this.resetTimers();

    // Listen to mousemove, keydown, click, scroll with throttling
    const events$ = merge(
      fromEvent(window, 'mousemove'),
      fromEvent(window, 'keydown'),
      fromEvent(window, 'click'),
      fromEvent(window, 'scroll')
    ).pipe(throttleTime(2000));

    this.activitySub = events$.subscribe(() => {
      this.ngZone.run(() => {
        // Reset timer only if the dialog is NOT currently open
        if (!this.dialogRef) {
          this.resetTimers();
        }
      });
    });
  }

  startMonitoring(): void {
    this.stopMonitoring();
    this.initActivityTracker();
  }

  stopMonitoring(): void {
    this.activitySub?.unsubscribe();
    this.clearTimers();
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

  private resetTimers(): void {
    this.clearTimers();

    // Setup main inactivity warning timer
    this.timeoutTimer = setTimeout(() => {
      this.showWarningDialog();
    }, this.TIMEOUT_MS - this.WARNING_MS);
  }

  private clearTimers(): void {
    if (this.timeoutTimer) clearTimeout(this.timeoutTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
  }

  private showWarningDialog(): void {
    this.ngZone.run(() => {
      if (this.dialogRef) return;

      this.dialogRef = this.dialog.open(TimeoutDialogComponent, {
        width: '400px',
        disableClose: true,
        data: { countdownSeconds: Math.floor(this.WARNING_MS / 1000) }
      });

      this.dialogRef.afterClosed().subscribe((extended) => {
        this.dialogRef = null;
        if (extended) {
          // User chose to extend session. Refresh profile API to ping server and reset
          this.authService.refreshProfile().subscribe({
            next: () => {
              this.resetTimers();
            },
            error: () => {
              // API down or unauthorized, just logout
              this.logoutUser();
            }
          });
        } else {
          // User clicked logout or countdown finished
          this.logoutUser();
        }
      });
    });
  }

  private logoutUser(): void {
    this.stopMonitoring();
    this.authService.logout();
  }
}

import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription, startWith, switchMap, catchError, of } from 'rxjs';
import { NotificationService } from './notification.service';

@Injectable({ providedIn: 'root' })
export class ApiHealthService {
  private http = inject(HttpClient);
  private notifications = inject(NotificationService);

  status = signal<'checking' | 'connected' | 'offline'>('checking');
  private pollSub?: Subscription;
  private hasAnnouncedStatus = false;

  constructor() {
    this.startMonitoring();
  }

  startMonitoring(): void {
    // Poll health check every 12 seconds
    this.pollSub = interval(12000)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.http.get<{ success: boolean }>('/api/health').pipe(
            catchError(() => of({ success: false }))
          )
        )
      )
      .subscribe({
        next: (res) => {
          const previous = this.status();
          const isConnected = !!(res && res.success);

          if (isConnected) {
            this.status.set('connected');
            if (this.hasAnnouncedStatus && previous === 'offline') {
              this.notifications.success('System online — API connection restored.');
            }
          } else {
            this.status.set('offline');
            if (this.hasAnnouncedStatus && previous === 'connected') {
              this.notifications.error('API offline — retrying connection automatically.', {
                action: 'Retry',
                onAction: () => this.checkImmediately(),
              });
            }
          }
          this.hasAnnouncedStatus = true;
        },
      });
  }

  checkImmediately(): void {
    this.http.get<{ success: boolean }>('/api/health').pipe(
      catchError(() => of({ success: false }))
    ).subscribe((res) => {
      this.status.set(res && res.success ? 'connected' : 'offline');
    });
  }

  destroy(): void {
    this.pollSub?.unsubscribe();
  }
}

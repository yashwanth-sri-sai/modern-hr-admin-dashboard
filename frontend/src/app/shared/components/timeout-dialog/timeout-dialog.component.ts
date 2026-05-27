import { Component, OnInit, OnDestroy, Inject, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-timeout-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  template: `
    <div class="dialog-card">
      <div class="warning-header">
        <mat-icon class="warn-icon">lock_clock</mat-icon>
        <h2 mat-dialog-title>Session Expiration Warning</h2>
      </div>

      <mat-dialog-content class="content">
        <p>You have been inactive for a while. For security, your session will automatically terminate in:</p>
        
        <div class="timer-display">
          <span class="seconds">{{ secondsRemaining() }}</span>
          <span class="label">seconds</span>
        </div>

        <mat-progress-bar
          mode="determinate"
          [value]="(secondsRemaining() / totalSeconds) * 100"
          color="accent"
          class="progress"
        ></mat-progress-bar>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="actions">
        <button mat-button (click)="onLogout()" class="logout-btn">Sign out</button>
        <button mat-flat-button color="primary" (click)="onExtend()" class="extend-btn">
          <mat-icon>check_circle</mat-icon> Keep Me Signed In
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .dialog-card {
      padding: 8px;
    }
    .warning-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
      .warn-icon {
        color: var(--warning);
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--text-primary);
      }
    }
    .content {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      padding: 0 0 16px 0 !important;
      margin: 0;
    }
    .timer-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 20px 0;
      padding: 16px;
      border-radius: 12px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      
      .seconds {
        font-size: 48px;
        font-weight: 800;
        color: var(--accent);
        line-height: 1;
      }
      .label {
        font-size: 11px;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-top: 4px;
      }
    }
    .progress {
      height: 6px;
      border-radius: 3px;
    }
    .actions {
      padding: 8px 0 0 0;
      gap: 8px;
    }
    .logout-btn {
      color: var(--text-muted);
    }
    .extend-btn {
      font-weight: 600;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
  `],
})
export class TimeoutDialogComponent implements OnInit, OnDestroy {
  dialogRef = inject(MatDialogRef<TimeoutDialogComponent>);
  
  secondsRemaining = signal(60);
  totalSeconds: number;
  private intervalId: any;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { countdownSeconds: number }) {
    this.secondsRemaining.set(data.countdownSeconds || 60);
    this.totalSeconds = data.countdownSeconds || 60;
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      this.secondsRemaining.update(s => s - 1);
      if (this.secondsRemaining() <= 0) {
        this.stopCountdown();
        this.dialogRef.close(false); // Close automatically, trigger logout
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  onExtend(): void {
    this.dialogRef.close(true); // Return true to extend
  }

  onLogout(): void {
    this.dialogRef.close(false); // Return false to logout
  }
}

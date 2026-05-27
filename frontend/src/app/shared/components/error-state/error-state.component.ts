import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <div class="error-icon-wrapper">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      @if (showRetry) {
        <button mat-stroked-button color="primary" (click)="onRetry()">
          <mat-icon>refresh</mat-icon>
          <span>{{ retryLabel }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
      text-align: center;
      background: rgba(239, 68, 68, 0.02);
      border: 1px dashed var(--danger);
      border-radius: 16px;
      margin: 16px 0;

      html.light-theme & {
        background: rgba(239, 68, 68, 0.01);
      }
    }
    .error-icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      mat-icon {
        color: var(--danger);
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }
    h3 {
      margin: 0 0 6px;
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
    }
    p {
      margin: 0 0 16px;
      font-size: 13px;
      color: var(--text-secondary);
      max-width: 320px;
      line-height: 1.5;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-color: rgba(239, 68, 68, 0.2) !important;
      color: var(--text-primary) !important;
      &:hover {
        background: rgba(239, 68, 68, 0.04) !important;
        border-color: var(--danger) !important;
      }
    }
  `],
})
export class ErrorStateComponent {
  @Input() title = 'Connection Failure';
  @Input() message = 'Failed to load data. Please check your internet connection and try again.';
  @Input() icon = 'cloud_off';
  @Input() showRetry = true;
  @Input() retryLabel = 'Retry Request';

  @Output() retry = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }
}

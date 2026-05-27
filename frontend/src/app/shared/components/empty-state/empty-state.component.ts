import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="empty-container" [class.compact]="compact">
      <div class="empty-icon-wrapper" [class.tinted]="tint">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <div class="empty-actions">
        @if (showRetry) {
          <button mat-stroked-button class="btn-premium" (click)="onRetry()">
            <mat-icon>refresh</mat-icon>
            {{ retryLabel }}
          </button>
        }
        @if (actionLabel) {
          <button mat-flat-button color="primary" class="btn-premium" (click)="onAction()">
            @if (actionIcon) {
              <mat-icon>{{ actionIcon }}</mat-icon>
            }
            {{ actionLabel }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .empty-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 56px 28px;
      text-align: center;
    }
    .empty-container.compact {
      padding: 36px 20px;
    }
    .empty-icon-wrapper {
      width: 72px;
      height: 72px;
      border-radius: 20px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      transition: transform 0.3s var(--ease-out-expo, ease);

      mat-icon {
        color: var(--text-muted);
        font-size: 36px;
        width: 36px;
        height: 36px;
      }

      &.tinted {
        background: rgba(124, 137, 255, 0.08);
        border-color: rgba(124, 137, 255, 0.2);
        mat-icon { color: var(--accent); }

        html.light-theme & {
          background: rgba(79, 70, 229, 0.08);
          border-color: rgba(79, 70, 229, 0.2);
        }
      }
    }
    .empty-container:hover .empty-icon-wrapper {
      transform: scale(1.03);
    }
    h3 {
      margin: 0 0 8px;
      font-size: var(--text-md, 16px);
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.2px;
    }
    p {
      margin: 0 0 20px;
      font-size: var(--text-sm, 13px);
      color: var(--text-muted);
      max-width: 340px;
      line-height: 1.6;
    }
    .empty-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;

      button {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border-radius: 10px !important;
      }
    }
  `],
})
export class EmptyStateComponent {
  @Input() title = 'No Data Found';
  @Input() message = 'There are no items matching the requested criteria.';
  @Input() icon = 'inbox';
  @Input() tint = true;
  @Input() compact = false;

  @Input() showRetry = false;
  @Input() retryLabel = 'Try Again';

  @Input() actionLabel = '';
  @Input() actionIcon = '';

  @Output() retry = new EventEmitter<void>();
  @Output() action = new EventEmitter<void>();

  onRetry(): void {
    this.retry.emit();
  }

  onAction(): void {
    this.action.emit();
  }
}

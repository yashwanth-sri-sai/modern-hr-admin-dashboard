import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatProgressSpinnerModule, MatProgressBarModule, CommonModule],
  template: `
    @if (variant === 'bar') {
      <div class="loading-bar" [class.active]="overlay">
        <mat-progress-bar mode="indeterminate" color="accent" />
      </div>
    } @else if (overlay) {
      <div class="spinner-overlay">
        <div class="spinner-container">
          <mat-spinner [diameter]="diameter" color="accent" />
          @if (message) {
            <p class="spinner-message">{{ message }}</p>
          }
        </div>
      </div>
    } @else {
      <div class="spinner-inline">
        <mat-spinner [diameter]="diameter" color="accent" />
      </div>
    }
  `,
  styles: [`
    .loading-bar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;

      &.active {
        opacity: 1;
      }

      mat-progress-bar {
        height: 3px;
      }
    }

    .spinner-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 17, 21, 0.6);
      backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.2s ease;

      html.light-theme & {
        background: rgba(255, 255, 255, 0.6);
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 28px 36px;
      background: var(--bg-elevated);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: var(--shadow-lg, 0 12px 40px rgba(0,0,0,0.35));
    }
    .spinner-message {
      color: var(--text-secondary);
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0.2px;
      margin: 0;
    }
    .spinner-inline {
      display: flex;
      justify-content: center;
      padding: 24px;
    }
  `],
})
export class SpinnerComponent {
  @Input() overlay = false;
  @Input() diameter = 40;
  @Input() message = '';
  /** `bar` = slim top progress; `overlay` = centered modal spinner */
  @Input() variant: 'overlay' | 'bar' = 'overlay';
}

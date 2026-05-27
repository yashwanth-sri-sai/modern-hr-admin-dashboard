import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'block' | 'stat-card' | 'table-row' | 'chart' | 'profile' | 'timeline';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [ngStyle]="{ gap: gap }" [class]="'variant-' + variant">
      @for (item of items; track $index) {
        @switch (variant) {
          @case ('stat-card') {
            <div class="skeleton-stat-card">
              <div class="skeleton-shimmer skeleton-icon"></div>
              <div class="skeleton-stat-lines">
                <div class="skeleton-shimmer skeleton-line lg"></div>
                <div class="skeleton-shimmer skeleton-line sm"></div>
              </div>
            </div>
          }
          @case ('table-row') {
            <div class="skeleton-table-row">
              <div class="skeleton-shimmer skeleton-cell wide"></div>
              <div class="skeleton-shimmer skeleton-cell"></div>
              <div class="skeleton-shimmer skeleton-cell"></div>
              <div class="skeleton-shimmer skeleton-cell"></div>
              <div class="skeleton-shimmer skeleton-cell"></div>
              <div class="skeleton-shimmer skeleton-cell narrow"></div>
            </div>
          }
          @case ('chart') {
            <div class="skeleton-chart">
              <div class="skeleton-shimmer skeleton-chart-title"></div>
              <div class="skeleton-shimmer skeleton-chart-body"></div>
            </div>
          }
          @case ('profile') {
            <div class="skeleton-profile">
              <div class="skeleton-shimmer skeleton-avatar"></div>
              <div class="skeleton-profile-lines">
                <div class="skeleton-shimmer skeleton-line md"></div>
                <div class="skeleton-shimmer skeleton-line xs"></div>
              </div>
            </div>
          }
          @case ('timeline') {
            <div class="skeleton-timeline-item">
              <div class="skeleton-shimmer skeleton-dot"></div>
              <div class="skeleton-timeline-body">
                <div class="skeleton-shimmer skeleton-line sm"></div>
                <div class="skeleton-shimmer skeleton-line md"></div>
              </div>
            </div>
          }
          @default {
            <div
              class="skeleton-shimmer skeleton-block"
              [ngStyle]="{ height: height, borderRadius: radius }"
            ></div>
          }
        }
      }
    </div>
  `,
  styles: [`
    .skeleton-wrapper {
      display: flex;
      flex-direction: column;
    }

    .skeleton-shimmer {
      background: linear-gradient(
        90deg,
        var(--skeleton-bg) 0%,
        var(--skeleton-shimmer) 45%,
        var(--skeleton-bg) 90%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .skeleton-block {
      width: 100%;
      margin-bottom: 0;
    }

    /* Stat card */
    .skeleton-stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      min-height: 100px;
    }
    .skeleton-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      flex-shrink: 0;
    }
    .skeleton-stat-lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    /* Table row */
    .skeleton-table-row {
      display: grid;
      grid-template-columns: 2.5fr 1.5fr 1.5fr 1.2fr 1.2fr 0.8fr;
      gap: 16px;
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      align-items: center;
    }
    .skeleton-cell {
      height: 14px;
      border-radius: 6px;
      &.wide { height: 18px; }
      &.narrow { width: 60%; }
    }

    /* Chart */
    .skeleton-chart {
      padding: 20px;
      border-radius: 16px;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-height: 220px;
    }
    .skeleton-chart-title {
      height: 14px;
      width: 40%;
      border-radius: 6px;
    }
    .skeleton-chart-body {
      flex: 1;
      min-height: 160px;
      border-radius: 12px;
    }

    /* Profile (navbar) */
    .skeleton-profile {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
    }
    .skeleton-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-profile-lines {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* Timeline */
    .skeleton-timeline-item {
      display: flex;
      gap: 14px;
      padding: 8px 0;
    }
    .skeleton-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .skeleton-timeline-body {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--bg-secondary);
    }

    .skeleton-line {
      border-radius: 6px;
      height: 12px;
      &.lg { height: 28px; width: 55%; }
      &.md { height: 14px; width: 75%; }
      &.sm { height: 12px; width: 40%; }
      &.xs { height: 10px; width: 50%; }
    }

    @media (max-width: 900px) {
      .skeleton-table-row {
        grid-template-columns: 1.5fr 1fr 1fr;
        .skeleton-cell:nth-child(4),
        .skeleton-cell:nth-child(5),
        .skeleton-cell:nth-child(6) {
          display: none;
        }
      }
    }
  `],
})
export class SkeletonLoaderComponent {
  @Input() count = 3;
  @Input() height = '60px';
  @Input() radius = '10px';
  @Input() gap = '12px';
  @Input() variant: SkeletonVariant = 'block';

  get items(): number[] {
    return Array.from({ length: this.count });
  }
}

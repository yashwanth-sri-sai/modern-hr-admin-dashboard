import { Component, OnInit, inject, signal, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityLog } from '../../models/activity.model';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { ErrorStateComponent } from '../error-state/error-state.component';

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    SkeletonLoaderComponent,
    EmptyStateComponent,
    ErrorStateComponent,
  ],
  template: `
    <div class="timeline-container">
      <div class="timeline-header">
        <div class="timeline-title-area">
          <h3>Audit Log Trail</h3>
          <span class="badge" *ngIf="activities().length">{{ activities().length }} total</span>
        </div>
        <button mat-icon-button (click)="refresh()" [disabled]="loading()" title="Refresh Logs">
          <mat-icon [class.spinning]="loading()">refresh</mat-icon>
        </button>
      </div>

      @if (loading()) {
        <div class="timeline-skeleton">
          <app-skeleton-loader [count]="4" height="64px" radius="12px" gap="14px" />
        </div>
      } @else if (error()) {
        <app-error-state
          title="Unable to Load Activity"
          message="The audit trail could not be retrieved. Please try again."
          icon="cloud_off"
          (retry)="refresh()"
        />
      } @else if (activities().length === 0) {
        <app-empty-state
          title="No Activity Yet"
          message="System events and user actions will appear here as they occur."
          icon="history_toggle_off"
          [compact]="true"
        />
      } @else {
        <div class="timeline">
          @for (act of displayedActivities(); track act.id) {
            <div class="timeline-item" [class.failure]="act.status === 'failure'">
              <div class="timeline-indicator">
                <div class="timeline-dot" [class]="act.action">
                  <mat-icon>{{ getIcon(act.action) }}</mat-icon>
                </div>
                <div class="timeline-line"></div>
              </div>
              <div class="timeline-content">
                <div class="timeline-meta">
                  <span class="user-ref">{{ act.username || 'System' }}</span>
                  <span class="time-ref" [title]="act.timestamp | date:'medium'">{{ formatRelativeTime(act.timestamp) }}</span>
                </div>
                <p class="desc">{{ act.description }}</p>
                <div class="timeline-footer" *ngIf="act.status === 'failure' || act.ipAddress">
                  <span class="chip-status warn" *ngIf="act.status === 'failure'">Failed Action</span>
                  <span class="ip-address" *ngIf="act.ipAddress">IP: {{ act.ipAddress }}</span>
                </div>
              </div>
            </div>
          }
        </div>

        <div class="show-more-bar" *ngIf="activities().length > limit">
          <button mat-button (click)="toggleLimit()">
            {{ limitExpanded ? 'Show Less' : 'View Full Audit Trail' }}
            <mat-icon>{{ limitExpanded ? 'expand_less' : 'expand_more' }}</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .timeline-container {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 380px;
    }
    .timeline-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      h3 {
        margin: 0;
        font-size: 15px;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
    .timeline-title-area {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .badge {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 20px;
      background: rgba(124, 137, 255, 0.08);
      color: var(--accent);
      font-weight: 600;
    }
    .timeline-skeleton {
      padding: 10px 0;
    }
    
    /* ── Timeline structure ─────────────────── */
    .timeline {
      display: flex;
      flex-direction: column;
      position: relative;
      margin-left: 12px;
      overflow-y: auto;
      max-height: 480px;
      padding-right: 4px;
    }
    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;
      &:last-child {
        padding-bottom: 8px;
        .timeline-line { display: none; }
      }
    }
    .timeline-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }
    .timeline-dot {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border);
      z-index: 2;
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
      
      /* Action specific colors */
      &.login { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.15); mat-icon { color: var(--success); } }
      &.logout { background: rgba(124, 137, 255, 0.08); border-color: rgba(124, 137, 255, 0.15); mat-icon { color: var(--accent); } }
      &.user_create { background: rgba(139, 92, 246, 0.08); border-color: rgba(139, 92, 246, 0.15); mat-icon { color: var(--accent-hover); } }
      &.user_delete { background: rgba(239, 68, 68, 0.08); border-color: rgba(239, 68, 68, 0.15); mat-icon { color: var(--danger); } }
      &.user_role_update { background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.15); mat-icon { color: var(--warning); } }
      &.user_update { background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.15); mat-icon { color: var(--warning); } }
      &.login_failed { 
        background: rgba(239, 68, 68, 0.12); 
        border-color: var(--danger); 
        animation: pulse-fail 2s infinite;
        mat-icon { color: var(--danger); } 
      }
      &.record_update { background: rgba(34, 197, 94, 0.08); border-color: rgba(34, 197, 94, 0.15); mat-icon { color: var(--success); } }
    }
    @keyframes pulse-fail {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 6px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    .timeline-line {
      width: 2px;
      flex-grow: 1;
      background: var(--border);
      margin-top: 4px;
      z-index: 1;
    }
    .timeline-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background: rgba(255,255,255,0.01);
      border: 1px solid rgba(255,255,255,0.03);
      border-radius: 12px;
      padding: 10px 14px;
      transition: background 0.2s;
      &:hover {
        background: rgba(255,255,255,0.02);
      }
    }
    .timeline-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .user-ref {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .time-ref {
      font-size: 11px;
      color: var(--text-muted);
    }
    .desc {
      margin: 0;
      font-size: 12px;
      color: var(--text-secondary);
      line-height: 1.4;
    }
    .timeline-footer {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;
    }
    .chip-status {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 1px 6px;
      border-radius: 4px;
      &.warn { background: rgba(239,68,68,0.08); color: var(--danger); border: 1px solid rgba(239,68,68,0.15); }
    }
    .ip-address {
      font-size: 10px;
      color: var(--text-muted);
    }

    .show-more-bar {
      margin-top: auto;
      padding-top: 12px;
      display: flex;
      justify-content: center;
      button {
        color: var(--accent);
        font-size: 12px;
        mat-icon { font-size: 16px; width: 16px; height: 16px; margin-left: 4px; }
      }
    }

    .error-panel {
      padding: 24px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      mat-icon { font-size: 40px; width: 40px; height: 40px; color: #f87171; }
      p { margin: 0; font-size: 13px; color: var(--text-muted); }
    }

    .spinning {
      animation: rotate 1s linear infinite;
    }
    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }
  `],
})
export class ActivityTimelineComponent implements OnInit {
  private activityService = inject(ActivityService);

  @Input() limit = 5;

  activities = signal<ActivityLog[]>([]);
  loading = signal(true);
  error = signal(false);

  limitExpanded = false;

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(): void {
    this.loading.set(true);
    this.error.set(false);
    this.activityService.getActivities().subscribe({
      next: (data) => {
        this.activities.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to fetch activity trail:', err);
        this.loading.set(false);
        this.error.set(true);
      },
    });
  }

  refresh(): void {
    this.loadActivities();
  }

  getIcon(action: string): string {
    switch (action) {
      case 'login': return 'login';
      case 'logout': return 'logout';
      case 'user_create': return 'person_add';
      case 'user_delete': return 'person_remove';
      case 'user_role_update': return 'admin_panel_settings';
      case 'user_update': return 'manage_accounts';
      case 'login_failed': return 'gpp_bad';
      case 'record_update': return 'assignment';
      default: return 'info';
    }
  }

  toggleLimit(): void {
    this.limitExpanded = !this.limitExpanded;
  }

  displayedActivities(): ActivityLog[] {
    if (this.limitExpanded) {
      return this.activities();
    }
    return this.activities().slice(0, this.limit);
  }

  formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }
}

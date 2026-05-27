import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivityTimelineComponent } from '../../shared/components/activity-timeline/activity-timeline.component';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActivityTimelineComponent],
  template: `
    <div class="audit-logs-page">
      <div class="page-header">
        <h1>Audit Log Trail</h1>
        <p>Comprehensive history of all system activities and user actions.</p>
      </div>
      
      <app-activity-timeline [limit]="100" />
    </div>
  `,
  styles: [`
    .audit-logs-page {
      padding: 24px;
      max-width: 1000px;
      margin: 0 auto;
      animation: fade-in 0.3s ease-out;
    }
    .page-header {
      margin-bottom: 24px;
      h1 {
        margin: 0 0 8px;
        font-size: 22px;
        font-weight: 700;
        color: var(--text-primary);
        letter-spacing: -0.01em;
      }
      p {
        margin: 0;
        color: var(--text-muted);
        font-size: 14px;
      }
    }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AuditLogsComponent {}

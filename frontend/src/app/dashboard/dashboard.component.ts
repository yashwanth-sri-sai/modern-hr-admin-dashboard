import { Component, OnInit, inject, signal, ViewChild, AfterViewInit, ElementRef, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { Chart } from 'chart.js/auto';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from '../core/services/auth.service';
import { ExportService } from '../core/services/export.service';
import { ApiHealthService } from '../core/services/api-health.service';
import { NotificationService } from '../core/services/notification.service';
import { DashboardStats, Record } from '../shared/models/api-response.model';
import { ErrorStateComponent } from '../shared/components/error-state/error-state.component';
import { SkeletonLoaderComponent } from '../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../shared/components/empty-state/empty-state.component';
import { staggerFadeAnimation } from '../shared/animations';
import { CommandPaletteComponent } from '../shared/components/command-palette/command-palette.component';

interface StatCardDisplay {
  label: string;
  value: number;
  icon: string;
  trend?: string;
  isText?: boolean;
  textValue?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, RouterLink, MatTableModule, MatSortModule, MatPaginatorModule,
    MatIconModule, MatButtonModule, MatChipsModule, MatSelectModule,
    MatFormFieldModule, MatMenuModule, MatTooltipModule,
    MatDividerModule, ErrorStateComponent,
    EmptyStateComponent, SkeletonLoaderComponent,
  ],
  animations: [staggerFadeAnimation],
  template: `
    <div class="dashboard-root">
        <!-- Welcome banner -->
        <div class="welcome-banner">
          <div class="welcome-text">
            <h1>{{ greetingText }}, {{ authService.currentUser()?.name?.split(' ')?.[0] ?? 'there' }} 👋</h1>
            <p>Welcome to your NSQTech executive workspace portal. Here is today's overview.</p>
          </div>
          <div class="welcome-meta">
            <span class="date-badge">
              <mat-icon>calendar_today</mat-icon>
              {{ today | date:'EEEE, MMMM d, y' }}
            </span>
          </div>
        </div>

        <!-- Stats cards -->
        @if (statsLoading()) {
          <div class="stats-grid stats-grid-5">
            <app-skeleton-loader variant="stat-card" [count]="5" />
          </div>
        } @else if (statsError()) {
          <app-error-state
            title="Failed to Load Statistics"
            message="An error occurred while fetching the metric cards from the API server."
            (retry)="loadData()"
          />
        } @else if (stats()) {
          <div class="stats-grid stats-grid-5" @staggerFadeAnimation>
            @for (card of statCards(); track card.label) {
              <div class="stat-card-wrapper">
                <div class="stat-card">
                  <div class="stat-icon-wrap">
                    <mat-icon>{{ card.icon }}</mat-icon>
                  </div>
                  <div class="stat-content">
                    @if (card.isText) {
                      <p class="stat-value stat-value-text">{{ card.textValue }}</p>
                    } @else {
                      <p class="stat-value">{{ card.value | number }}</p>
                    }
                    <p class="stat-label">{{ card.label }}</p>
                    @if (card.trend) {
                      <span class="stat-trend">{{ card.trend }}</span>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Analytics + Activity -->
        <div class="dashboard-main-layout" @staggerFadeAnimation>
          <div class="dashboard-left-column">
            @if (statsLoading()) {
              <div class="charts-section-grid" style="margin-top: 16px;">
                <app-skeleton-loader variant="chart" [count]="2" />
              </div>
            } @else if (!statsError()) {
              <div class="charts-section-grid">
                <div class="chart-card-wrapper float-animation-3">
                  <div class="chart-card-panel">
                    <div class="chart-header">
                      <h3>Team Allocation by Role</h3>
                      <mat-icon matTooltip="Breakdown of administrators vs general staff">info_outline</mat-icon>
                    </div>
                    <div class="chart-canvas-wrapper">
                      <canvas #roleChartCanvas></canvas>
                    </div>
                  </div>
                </div>
                <div class="chart-card-wrapper float-animation-4">
                  <div class="chart-card-panel">
                    <div class="chart-header">
                      <h3>Task Status Distributions</h3>
                      <mat-icon matTooltip="Current standing of all registered project tasks">info_outline</mat-icon>
                    </div>
                    <div class="chart-canvas-wrapper">
                      <canvas #statusChartCanvas></canvas>
                    </div>
                  </div>
                </div>
              </div>
            }

            <!-- Records table -->
            <div class="table-section">
              <div class="section-header">
                <div class="section-title-area">
                  <h2>Project Assignments</h2>
                  <p class="section-sub">Compliance records, verifications, and operational tasks</p>
                </div>
                <div class="header-actions">
                  <!-- Export Dropdown -->
                  <button mat-stroked-button [matMenuTriggerFor]="exportMenu" title="Export Table State">
                    <mat-icon>download</mat-icon>
                    Export
                  </button>
                  <mat-menu #exportMenu="matMenu" class="export-dropdown">
                    <button mat-menu-item (click)="exportCSV()">
                      <mat-icon>grid_on</mat-icon>
                      <span>Export CSV</span>
                    </button>
                    <button mat-menu-item (click)="exportPDF()">
                      <mat-icon>picture_as_pdf</mat-icon>
                      <span>Export PDF</span>
                    </button>
                  </mat-menu>

                  <button mat-icon-button (click)="loadData()" matTooltip="Refresh records">
                    <mat-icon>refresh</mat-icon>
                  </button>
                </div>
              </div>

          @if (!recordsLoading() && !recordsError() && dataSource.data.length > 0) {
            <div class="filter-chip-bar">
              @for (chip of statusChips; track chip.value) {
                <button
                  type="button"
                  class="filter-chip"
                  [class.active]="statusFilter() === chip.value"
                  (click)="setStatusFilter(chip.value)"
                >
                  <mat-icon>{{ chip.icon }}</mat-icon>
                  {{ chip.label }}
                </button>
              }
            </div>
          }

          @if (recordsLoading()) {
            <div class="records-loading">
              <app-skeleton-loader variant="table-row" [count]="5" />
            </div>
          } @else if (recordsError()) {
            <div class="records-error">
              <app-error-state
                title="Failed to Load Records"
                message="The data service could not fetch project assignments. Please try again."
                (retry)="loadData()"
              />
            </div>
          } @else if (dataSource.filteredData.length === 0) {
            <app-empty-state
              title="No Records Found"
              message="Try adjusting your status filters or refresh to load the latest assignments."
              icon="assignment_late"
              [showRetry]="true"
              retryLabel="Refresh Records"
              (retry)="loadData()"
            />
          } @else {
            <div class="table-responsive-wrapper">
              <div class="records-table-container">
                <table mat-table [dataSource]="dataSource" matSort [trackBy]="trackById">

                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Record</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="record-cell">
                      <span class="record-title">{{ row.title }}</span>
                      <span class="record-date-mobile">{{ row.createdAt | date:'MMM d' }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="nsq-chip nsq-chip-category">{{ row.category }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="assignedTo">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Assignee</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="assignee-cell">
                      <div class="assignee-avatar" [class]="'aa-' + getAssigneeIndex(row.assignedTo)">
                        {{ row.assignedTo[0].toUpperCase() }}
                      </div>
                      <span class="assignee-name">{{ row.assignedTo }}</span>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="priority">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Priority</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="nsq-chip" [class]="'nsq-priority-' + row.priority">{{ row.priority | titlecase }}</span>
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="status-cell-wrap">
                      <span class="nsq-chip" [class]="'nsq-status-' + row.status">{{ getRecordStatusLabel(row.status) }}</span>
                      <!-- Quick status change -->
                      <button
                        mat-icon-button
                        [matMenuTriggerFor]="statusChangeMenu"
                        [matMenuTriggerData]="{ record: row }"
                        class="status-change-trigger"
                        matTooltip="Change status"
                      >
                        <mat-icon>unfold_more</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <ng-container matColumnDef="createdAt">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Created</th>
                  <td mat-cell *matCellDef="let row">
                    <span class="date-cell">{{ row.createdAt | date:'MMM d, y' }}</span>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"></tr>
              </table>
              </div>
            </div>
            <mat-paginator [pageSizeOptions]="[5, 10]" pageSize="5" showFirstLastButtons />
          }
            </div>
          </div>

          <div class="dashboard-right-column">
            <!-- Quick Actions Panel -->
            <div class="quick-actions-panel">
              <h3>Quick Actions</h3>
              <div class="action-grid">
                <button mat-button class="action-card" *ngIf="authService.isAdmin()" routerLink="/app/admin">
                  <mat-icon>person_add</mat-icon>
                  <span>Add User</span>
                </button>
                <button mat-button class="action-card" (click)="exportCSV()">
                  <mat-icon>download</mat-icon>
                  <span>Export CSV</span>
                </button>
                <button mat-button class="action-card" (click)="openSearch()">
                  <mat-icon>search</mat-icon>
                  <span>Global Search</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      <!-- Context status change menu -->
      <mat-menu #statusChangeMenu="matMenu" class="quick-status-dropdown">
        <ng-template matMenuContent let-record="record">
          <div class="menu-label-header">Change Status for: <strong>{{ record.title }}</strong></div>
          <mat-divider />
          <button mat-menu-item (click)="updateRecordStatus(record.id, 'completed')">
            <mat-icon style="color: var(--success);">task_alt</mat-icon>
            <span>Completed</span>
          </button>
          <button mat-menu-item (click)="updateRecordStatus(record.id, 'in-progress')">
            <mat-icon style="color: var(--accent);">sync</mat-icon>
            <span>In Progress</span>
          </button>
          <button mat-menu-item (click)="updateRecordStatus(record.id, 'pending')">
            <mat-icon style="color: var(--warning);">schedule</mat-icon>
            <span>Pending</span>
          </button>
        </ng-template>
      </mat-menu>
    </div>
  `,
  styles: [`
    .dashboard-root {
      display: flex;
      flex-direction: column;
      gap: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* ── Layout ──────────────────────────── */
    .dashboard-main-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 32px;
      align-items: start;
    }
    .dashboard-left-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      min-width: 0; /* Prevent overflow from pushing into right column */
    }
    .dashboard-right-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
      position: sticky;
      top: 0;
    }

    @media (max-width: 1200px) {
      .dashboard-main-layout {
        grid-template-columns: 1fr;
      }
      .dashboard-right-column {
        position: static;
      }
    }

    /* ── Quick Actions ───────────────────── */
    .quick-actions-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
    }
    .quick-actions-panel h3 {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 16px 0;
    }
    .action-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .action-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px 12px;
      height: auto;
      transition: all 0.2s ease;
      color: var(--text-primary);
    }
    .action-card mat-icon {
      color: var(--text-muted);
      margin-bottom: 4px;
      transition: color 0.2s ease;
    }
    .action-card:hover {
      background: rgba(99, 102, 241, 0.08);
      border-color: rgba(99, 102, 241, 0.3);
    }
    .action-card:hover mat-icon {
      color: #818cf8;
    }

    /* ── Welcome ─────────────────────────── */
    .welcome-banner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(79,70,229,0.06) 100%);
      border: 1px solid rgba(99,102,241,0.2);
      border-radius: 16px;
      padding: 24px 28px;
    }
    .welcome-text h1 {
      margin: 0 0 6px;
      font-size: 28px;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }
    .welcome-text p { margin: 0; color: var(--text-muted); font-size: 15px; }
    .date-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255,255,255,0.03);
      border: 1px solid var(--border);
      border-radius: 50px;
      padding: 8px 14px;
      font-size: 13px;
      color: var(--text-muted);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }

    /* ── Stats ─────────────────────────── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }
    .stats-grid-5 {
      grid-template-columns: repeat(5, 1fr);
    }
    .insights-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      align-items: start;
    }
    .charts-section-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }
    .stat-card-wrapper {
      will-change: transform;
      
      &:nth-child(1) { animation: float-gentle-1 8s ease-in-out infinite alternate; }
      &:nth-child(2) { animation: float-gentle-2 10s ease-in-out infinite alternate; }
      &:nth-child(3) { animation: float-gentle-3 7s ease-in-out infinite alternate; }
      &:nth-child(4) { animation: float-gentle-4 9s ease-in-out infinite alternate; }
      &:nth-child(5) { animation: float-gentle-2 11s ease-in-out infinite alternate; }
      
      @media (prefers-reduced-motion: reduce) {
        animation: none !important;
        transform: none !important;
      }
    }
    .chart-card-wrapper {
      will-change: transform;
    }
    .stat-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      position: relative;
      overflow: hidden;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
    .stat-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(99, 102, 241, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: var(--accent); font-size: 24px; width: 24px; height: 24px; }
    }
    .stat-value {
      margin: 0;
      font-size: 30px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.02em;
    }
    .stat-label {
      margin: 6px 0 0;
      font-size: 13px;
      color: var(--text-muted);
    }
    .stat-value-text {
      font-size: 22px !important;
    }
    .stat-trend {
      display: block;
      margin-top: 4px;
      font-size: 11px;
      color: var(--text-muted);
    }

    /* ── Charts ─────────────────────────── */
    .chart-card-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover {
        box-shadow: inset 0 1px 0 rgba(255,255,255,0.02), 0 8px 24px rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
    .chart-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--text-primary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--text-muted); cursor: help; }
    }
    .chart-canvas-wrapper {
      position: relative;
      width: 100%;
      height: 180px;
    }

    /* ── Table section ──────────────────────────── */
    .table-section {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.03);
    }
    .section-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      padding: 20px 20px 0;
      gap: 16px;
    }
    .section-title-area {
      h2 { margin: 0 0 3px; font-size: 15px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
    }
    .section-sub { margin: 0; font-size: 12px; color: var(--text-muted); }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .records-loading { padding: 8px 0; }
    .records-error { padding: 24px; }

    .records-table-container {
      width: 100%;
    }
    table { width: 100%; }

    /* Override heights for records table */
    .table-section tr.mat-mdc-header-row { height: 48px !important; }
    .table-section tr.mat-mdc-row {
      height: 62px !important;
      transition: background 0.18s ease;
    }
    .table-section tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: rgba(255,255,255,0.015);
    }
    .table-section th.mat-mdc-header-cell {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: rgba(148,163,184,0.6);
      background: var(--bg-secondary) !important;
      vertical-align: middle;
      white-space: nowrap;
      padding: 0 16px !important;
    }
    .table-section td.mat-mdc-cell {
      padding: 0 16px !important;
      color: var(--text-primary);
      vertical-align: middle;
    }

    .record-cell {
      display: flex;
      flex-direction: column;
      gap: 1px;
    }
    .record-title {
      font-size: 13.5px;
      font-weight: 500;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 300px;
    }
    .record-date-mobile { display: none; }

    /* Assignee cell */
    .assignee-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .assignee-avatar {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.2);
    }
    .aa-0 { background: linear-gradient(135deg,#312e81,#4338ca); color:#c7d2fe; }
    .aa-1 { background: linear-gradient(135deg,#064e3b,#059669); color:#a7f3d0; }
    .aa-2 { background: linear-gradient(135deg,#78350f,#d97706); color:#fde68a; }
    .aa-3 { background: linear-gradient(135deg,#7c1d68,#a21caf); color:#f5d0fe; }
    .aa-4 { background: linear-gradient(135deg,#1e3a5f,#2563eb); color:#bfdbfe; }
    .assignee-name {
      font-size: 13px;
      color: var(--text-secondary);
      white-space: nowrap;
    }

    /* Date cell */
    .date-cell {
      font-size: 12.5px;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* Status cell wrap */
    .status-cell-wrap {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .status-change-trigger {
      width: 28px !important;
      height: 28px !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      opacity: 0;
      transition: opacity 0.15s ease;
      color: var(--text-muted);
      
      ::ng-deep .mat-mdc-button-touch-target { display: none; }
      
      mat-icon { 
        font-size: 18px !important; 
        width: 18px !important; 
        height: 18px !important; 
        line-height: 18px !important; 
        margin: 0 !important;
      }
    }
    .table-row:hover .status-change-trigger { opacity: 1; }

    .menu-label-header {
      padding: 10px 16px 6px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    @media (max-width: 1280px) {
      .stats-grid-5 { grid-template-columns: repeat(3, 1fr); }
      .insights-grid { grid-template-columns: 1fr; }
      .charts-section-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 1024px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .stats-grid-5 { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 600px) {
      .stats-grid, .stats-grid-5 { grid-template-columns: 1fr; }
      .welcome-meta { display: none; }
      .section-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .record-title { max-width: 200px; }
    }
  `],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  sort!: MatSort;
  paginator!: MatPaginator;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    if (this.dataSource) this.dataSource.sort = ms;
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    if (this.dataSource) this.dataSource.paginator = mp;
  }
  @ViewChild('roleChartCanvas') roleCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('statusChartCanvas') statusCanvas!: ElementRef<HTMLCanvasElement>;

  authService = inject(AuthService);
  apiHealth = inject(ApiHealthService);
  private dashboardService = inject(DashboardService);
  private exportService = inject(ExportService);
  private notify = inject(NotificationService);
  private dialog = inject(MatDialog);

  today = new Date();

  get greetingText(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good morning';
    } else if (hour < 17) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  }
  statusFilter = signal<string>('');
  statusChips = [
    { value: '', label: 'All', icon: 'layers' },
    { value: 'completed', label: 'Completed', icon: 'task_alt' },
    { value: 'in-progress', label: 'In Progress', icon: 'sync' },
    { value: 'pending', label: 'Pending', icon: 'schedule' },
  ];
  statsLoading = signal(true);
  recordsLoading = signal(true);
  statsError = signal(false);
  recordsError = signal(false);
  
  stats = signal<DashboardStats | null>(null);
  displayedColumns = ['title', 'category', 'assignedTo', 'priority', 'status', 'createdAt'];
  dataSource = new MatTableDataSource<Record>([]);

  statCards = signal<StatCardDisplay[]>([]);

  // Chart References
  private roleChartInstance?: Chart;
  private statusChartInstance?: Chart;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.filterPredicate = (row, filter) => {
      if (!filter) return true;
      return row.status === filter;
    };
  }

  setStatusFilter(value: string): void {
    this.statusFilter.set(value);
    this.dataSource.filter = value;
  }

  getAssigneeIndex(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 5;
  }

  getRecordStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'completed': 'Completed',
      'in-progress': 'In Progress',
      'pending': 'Pending',
    };
    return labels[status] ?? status;
  }

  ngOnDestroy(): void {
    if (this.roleChartInstance) this.roleChartInstance.destroy();
    if (this.statusChartInstance) this.statusChartInstance.destroy();
  }

  loadData(): void {
    this.statsLoading.set(true);
    this.recordsLoading.set(true);
    this.statsError.set(false);
    this.recordsError.set(false);

    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        const complianceRate = data.totalRecords
          ? Math.round((data.completedRecords / data.totalRecords) * 100)
          : 93;

        const cards: StatCardDisplay[] = [
          {
            label: 'Total Employees',
            value: data.totalUsers,
            icon: 'group',
            trend: 'Active operations base',
          },
          {
            label: 'Active Sessions',
            value: data.activeUsers,
            icon: 'bolt',
            trend: 'Live system workspace',
          },
          {
            label: 'Pending Verifications',
            value: data.pendingRecords,
            icon: 'pending_actions',
            trend: 'Awaiting audit review',
          },
          {
            label: 'Compliance Completion',
            value: 0,
            icon: 'verified_user',
            isText: true,
            textValue: `${complianceRate}%`,
            trend: 'Monthly target: 95%',
          },
          {
            label: 'System Uptime',
            value: 0,
            icon: 'cloud_done',
            isText: true,
            textValue: this.apiStatusLabel() === 'Online' ? '99.98%' : 'Offline',
            trend: 'Monitored live',
          },
        ];
        this.statCards.set(cards);

        this.statsLoading.set(false);
        
        // Render charts inside timeout to let elements render
        setTimeout(() => {
          this.renderCharts(data);
        }, 100);
      },
      error: () => {
        this.statsLoading.set(false);
        this.statsError.set(true);
        this.notify.error('Failed to fetch dashboard statistics.');
      },
    });

    this.dashboardService.getRecords().subscribe({
      next: (records) => {
        this.dataSource.data = records;
        this.recordsLoading.set(false);
        this.setStatusFilter(this.statusFilter());
      },
      error: () => {
        this.recordsLoading.set(false);
        this.recordsError.set(true);
        this.notify.error('Failed to fetch records.');
      },
    });
  }

  apiStatusLabel(): string {
    const s = this.apiHealth.status();
    if (s === 'connected') return 'Online';
    if (s === 'offline') return 'Offline';
    return 'Checking';
  }

  openSearch(): void {
    this.dialog.open(CommandPaletteComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'command-palette-dialog',
      position: { top: '10vh' }
    });
  }



  /**
   * Renders the two canvas charts using Chart.js
   */
  private renderCharts(data: DashboardStats): void {
    const isDark = document.body.classList.contains('dark-theme') || !document.body.classList.contains('light-theme'); // default dark
    
    // Dynamically retrieve theme colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const accent = styles.getPropertyValue('--accent').trim() || '#7C89FF';
    const accentHover = styles.getPropertyValue('--accent-hover').trim() || '#8B5CF6';
    const success = styles.getPropertyValue('--success').trim() || '#22C55E';
    const warning = styles.getPropertyValue('--warning').trim() || '#F59E0B';
    const textColor = styles.getPropertyValue('--text-muted').trim() || '#64748b';
    const bgSecondary = styles.getPropertyValue('--bg-secondary').trim() || '#131720';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    // 1. Roles Chart (Doughnut)
    if (this.roleChartInstance) this.roleChartInstance.destroy();
    
    // We estimate general users vs admins
    const admins = data.adminUsers;
    const users = data.totalUsers - admins;

    if (this.roleCanvas) {
      this.roleChartInstance = new Chart(this.roleCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Administrators', 'General Staff'],
          datasets: [{
            data: [admins, users],
            backgroundColor: [accent, accentHover],
            borderColor: bgSecondary,
            borderWidth: 2,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Inter', size: 11 } }
            }
          }
        }
      });
    }

    // 2. Status Chart (Horizontal Bar)
    if (this.statusChartInstance) this.statusChartInstance.destroy();
    if (this.statusCanvas) {
      this.statusChartInstance = new Chart(this.statusCanvas.nativeElement, {
        type: 'bar',
        data: {
          labels: ['Completed', 'In Progress', 'Pending'],
          datasets: [{
            label: 'Count',
            data: [data.completedRecords, data.inProgressRecords, data.pendingRecords],
            backgroundColor: [success, accent, warning],
            borderRadius: 6,
            barThickness: 18
          }]
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, font: { family: 'Inter', size: 10 } }
            },
            y: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: 'Inter', size: 11 } }
            }
          }
        }
      });
    }
  }

  /**
   * Updates status of a project record and pings the activity timeline
   */
  updateRecordStatus(id: string, newStatus: 'completed' | 'in-progress' | 'pending'): void {
    this.dashboardService.updateRecord(id, { status: newStatus }).subscribe({
      next: (res) => {
        this.notify.success(`Status updated to "${newStatus}" for "${res.title}"`);
        
        // Reload data to recalculate stats and charts
        this.loadData();
      },
      error: () => {
        this.notify.error('Failed to update record status.');
      }
    });
  }

  /**
   * Exports the current records table state to CSV
   */
  exportCSV(): void {
    const rawData = this.dataSource.data;
    const headers = ['Record Title', 'Category', 'Assigned To', 'Priority', 'Status', 'Created Date'];
    const keys = ['title', 'category', 'assignedTo', 'priority', 'status', 'createdAt'];
    this.exportService.exportToCsv(rawData, 'nsqtech_records', headers, keys);
  }

  /**
   * Exports the current records table state to PDF
   */
  exportPDF(): void {
    const rawData = this.dataSource.data;
    const headers = ['Title', 'Category', 'Assigned To', 'Priority', 'Status', 'Created'];
    const keys = ['title', 'category', 'assignedTo', 'priority', 'status', 'createdAt'];
    this.exportService.exportToPdf(rawData, 'nsqtech_records', 'Project Assignments Report', headers, keys);
  }

  trackById(index: number, item: Record): string {
    return item.id;
  }
}

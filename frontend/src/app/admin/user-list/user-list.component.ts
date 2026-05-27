import {
  Component, OnInit, OnDestroy, inject, signal, ViewChild, AfterViewInit, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NotificationService } from '../../core/services/notification.service';
import { ErrorStateComponent } from '../../shared/components/error-state/error-state.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { UserManagementService } from '../services/user-management.service';
import { AuthService } from '../../core/services/auth.service';
import { ExportService } from '../../core/services/export.service';
import { UserFormComponent, UserFormDialogData } from '../user-form/user-form.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SkeletonLoaderComponent } from '../../shared/components/skeleton-loader/skeleton-loader.component';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { RoleLabelPipe } from '../../shared/pipes/role-label.pipe';
import { User } from '../../shared/models/user.model';
import { staggerFadeAnimation, fadeAnimation } from '../../shared/animations';

@Component({
  selector: 'app-user-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatTableModule, MatSortModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule,
    MatChipsModule, MatDialogModule,
    MatTooltipModule, SkeletonLoaderComponent, EmptyStateComponent, ErrorStateComponent, RoleLabelPipe,
  ],
  animations: [staggerFadeAnimation, fadeAnimation],
  template: `
    <div class="user-list">
      <!-- Page header -->
      <div class="page-header">
        <div class="page-header-text">
          <h1>User Directory</h1>
          <p>Manage team members, roles, access levels and employee profiles</p>
        </div>
        <div class="header-buttons">
          <button mat-stroked-button class="export-btn" [matMenuTriggerFor]="exportMenu" title="Export Table State">
            <mat-icon>download</mat-icon>
            Export
          </button>
          <mat-menu #exportMenu="matMenu">
            <button mat-menu-item (click)="exportCSV()">
              <mat-icon>grid_on</mat-icon>
              <span>Export CSV</span>
            </button>
            <button mat-menu-item (click)="exportPDF()">
              <mat-icon>picture_as_pdf</mat-icon>
              <span>Export PDF</span>
            </button>
          </mat-menu>

          <button mat-flat-button color="primary" class="add-btn" (click)="openCreateDialog()">
            <mat-icon>person_add</mat-icon>
            Add Employee
          </button>
        </div>
      </div>

      <!-- Summary chips -->
      @if (!isLoading()) {
        <div class="summary-chips" @fadeAnimation>
          <div class="summary-chip all">
            <mat-icon>group</mat-icon>
            <span>{{ dataSource.data.length }} Total</span>
          </div>
          <div class="summary-chip active">
            <mat-icon>check_circle</mat-icon>
            <span>{{ activeCount() }} Active</span>
          </div>
          <div class="summary-chip pending">
            <mat-icon>pending_actions</mat-icon>
            <span>{{ pendingCount() }} Pending</span>
          </div>
          <div class="summary-chip admin">
            <mat-icon>admin_panel_settings</mat-icon>
            <span>{{ adminCount() }} Admins</span>
          </div>
        </div>
      }

      <!-- Table card -->
      <div class="table-card">
        <!-- Filters bar -->
        <div class="filters-bar">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search employees…</mat-label>
            <input
              matInput
              [formControl]="searchCtrl"
              placeholder="Name, email, department"
              aria-label="Search users input"
            />
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Role</mat-label>
            <mat-select [formControl]="roleFilter" aria-label="Filter by Role">
              <mat-option value="">All Roles</mat-option>
              <mat-option value="admin">Administrator</mat-option>
              <mat-option value="user">General User</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" class="filter-field">
            <mat-label>Status</mat-label>
            <mat-select [formControl]="statusFilter" aria-label="Filter by Status">
              <mat-option value="">All Status</mat-option>
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="pending">Pending</mat-option>
              <mat-option value="on-leave">On Leave</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
              <mat-option value="offline">Offline</mat-option>
            </mat-select>
          </mat-form-field>

          <div class="filter-actions">
            <button mat-stroked-button (click)="clearFilters()" class="clear-btn">
              <mat-icon>filter_alt_off</mat-icon>
              Clear
            </button>
            <button mat-icon-button (click)="loadUsers()" matTooltip="Refresh" class="refresh-btn">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>

        <!-- Divider -->
        <div class="table-divider"></div>

        <!-- Loading state -->
        @if (isLoading()) {
          <div class="table-loading" @fadeAnimation>
            <app-skeleton-loader [count]="7" variant="table-row" gap="0" />
          </div>
        } @else if (loadError()) {
          <div class="table-error" @fadeAnimation>
            <app-error-state
              title="Unable to Load Employees"
              message="We couldn't retrieve the user directory. Please check your connection and try again."
              (retry)="loadUsers()"
            />
          </div>
        } @else {
          <div class="table-responsive-wrapper" @fadeAnimation>
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort @staggerFadeAnimation [trackBy]="trackById">

              <!-- User column -->
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Employee</th>
                <td mat-cell *matCellDef="let row">
                  <div class="user-cell">
                    <div class="user-avatar" [class]="'avatar-' + (getAvatarIndex(row.name))">
                      {{ getInitials(row.name) }}
                    </div>
                    <div class="user-info">
                      <p class="user-name">{{ row.name }}</p>
                      <p class="user-meta">
                        <span class="user-email">{{ row.email }}</span>
                        @if (row.employeeId) {
                          <span class="user-emp-id">{{ row.employeeId }}</span>
                        }
                      </p>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Department column -->
              <ng-container matColumnDef="department">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Department</th>
                <td mat-cell *matCellDef="let row">
                  <span class="dept-label">{{ row.department }}</span>
                </td>
              </ng-container>

              <!-- Role column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Role</th>
                <td mat-cell *matCellDef="let row">
                  <span class="nsq-role-badge" [class.admin]="row.role === 'admin'">
                    <mat-icon>{{ row.role === 'admin' ? 'admin_panel_settings' : 'person' }}</mat-icon>
                    {{ row.role | roleLabel }}
                  </span>
                </td>
              </ng-container>

              <!-- Status column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Status</th>
                <td mat-cell *matCellDef="let row">
                  <div class="status-badge" [ngClass]="'status-' + row.status">
                    <span class="status-dot"></span>
                    <span class="status-label">{{ getStatusLabel(row.status) }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Office Location column -->
              <ng-container matColumnDef="officeLocation">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Location</th>
                <td mat-cell *matCellDef="let row">
                  <span class="location-cell">
                    <mat-icon>location_on</mat-icon>
                    {{ row.officeLocation || '—' }}
                  </span>
                </td>
              </ng-container>

              <!-- Joined column -->
              <ng-container matColumnDef="createdAt">
                <th mat-header-cell *matHeaderCellDef mat-sort-header>Joined</th>
                <td mat-cell *matCellDef="let row">
                  <span class="date-cell">{{ row.createdAt | date:'MMM d, y' }}</span>
                </td>
              </ng-container>

              <!-- Actions column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef class="actions-header">Actions</th>
                <td mat-cell *matCellDef="let row">
                  <div class="action-buttons">
                    <button
                      mat-icon-button
                      class="action-btn edit-btn"
                      matTooltip="Edit employee"
                      (click)="openEditDialog(row)"
                    >
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button
                      mat-icon-button
                      class="action-btn delete-btn"
                      [disabled]="row.id === authService.currentUser()?.id"
                      [matTooltip]="row.id === authService.currentUser()?.id ? 'Cannot delete your own account' : 'Remove employee'"
                      (click)="confirmDelete(row)"
                    >
                      <mat-icon>delete_outline</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
              <tr
                mat-row
                *matRowDef="let row; columns: displayedColumns;"
                class="table-row"
                [class.deleting]="deletingId() === row.id"
              ></tr>

              <!-- No data row -->
              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="padding: 0;">
                  <div @fadeAnimation>
                    <app-empty-state
                      title="No Employees Found"
                      message="Try adjusting your filters or search terms to find team members."
                      icon="person_search"
                      actionLabel="Clear Filters"
                      actionIcon="filter_alt_off"
                      (action)="clearFilters()"
                    />
                  </div>
                </td>
              </tr>
            </table>
            </div>
          </div>
          <mat-paginator
            [pageSizeOptions]="[10, 25, 50]"
            pageSize="10"
            showFirstLastButtons
          />
        }
      </div>
    </div>
  `,
  styles: [`
    .user-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ──────────────────────── */
    .page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }
    .page-header-text {
      h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
      p { margin: 0; font-size: 13px; color: var(--text-muted); }
    }
    .header-buttons {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .add-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      border-radius: 10px !important;
      font-weight: 600;
    }

    /* ── Summary chips ───────────────── */
    .summary-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .summary-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 50px;
      font-size: 12.5px;
      font-weight: 600;
      mat-icon { font-size: 15px; width: 15px; height: 15px; }
    }
    .summary-chip.all     { background: rgba(99,102,241,0.10); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.18); }
    .summary-chip.active  { background: rgba(34,197,94,0.10);  color: #4ade80; border: 1px solid rgba(34,197,94,0.18); }
    .summary-chip.pending { background: rgba(251,191,36,0.10); color: #fbbf24; border: 1px solid rgba(251,191,36,0.18); }
    .summary-chip.admin   { background: rgba(139,92,246,0.10); color: #c4b5fd; border: 1px solid rgba(139,92,246,0.18); }

    /* ── Table card ──────────────────── */
    .table-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03);
    }

    /* ── Filters bar ─────────────────── */
    .filters-bar {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding: 20px 20px 0;
    }
    .search-field { flex: 1; min-width: 160px; }
    .filter-field { width: 130px; flex-shrink: 0; }
    .filter-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: auto;
    }
    .clear-btn { flex-shrink: 0; }

    .table-divider {
      height: 1px;
      background: var(--border);
      margin: 16px 0 0;
    }

    /* ── Loading / error states ──────── */
    .table-loading { padding: 16px 0; }
    .table-error { padding: 24px; }

    /* ── Table container ─────────────── */
    .table-responsive-wrapper {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .table-container {
      width: 100%;
    }
    table { width: 100%; }

    /* Override Material header/row heights */
    tr.mat-mdc-header-row { height: 48px !important; }
    tr.mat-mdc-row {
      height: 56px !important;
      cursor: default;
      transition: background 0.18s ease;
    }
    tr.mat-mdc-row:hover td.mat-mdc-cell {
      background: rgba(255,255,255,0.018);
    }
    tr.mat-mdc-row.deleting {
      opacity: 0.35;
      pointer-events: none;
    }
    th.mat-mdc-header-cell {
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.06em;
      color: rgba(148,163,184,0.65);
      background: var(--bg-secondary) !important;
      vertical-align: middle;
      white-space: nowrap;
    }
    td.mat-mdc-cell {
      color: var(--text-primary);
      vertical-align: middle;
    }
    .actions-header { text-align: right; }

    .user-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .user-avatar {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      font-weight: 700;
      flex-shrink: 0;
      letter-spacing: -0.01em;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.12);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    tr.mat-mdc-row:hover .user-avatar {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.15);
    }

    /* Curated avatar palettes — warm, cool, professional */
    .avatar-0 { background: linear-gradient(135deg, #312e81 0%, #4338ca 100%); color: #c7d2fe; }
    .avatar-1 { background: linear-gradient(135deg, #064e3b 0%, #059669 100%); color: #a7f3d0; }
    .avatar-2 { background: linear-gradient(135deg, #78350f 0%, #d97706 100%); color: #fde68a; }
    .avatar-3 { background: linear-gradient(135deg, #7c1d68 0%, #a21caf 100%); color: #f5d0fe; }
    .avatar-4 { background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%); color: #bfdbfe; }
    .avatar-5 { background: linear-gradient(135deg, #44155a 0%, #7c3aed 100%); color: #ddd6fe; }
    .avatar-6 { background: linear-gradient(135deg, #3d1515 0%, #dc2626 100%); color: #fecaca; }
    .avatar-7 { background: linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%); color: #bae6fd; }

    .user-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }
    .user-name {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.3;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-meta {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
    }
    .user-email {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }
    .user-emp-id {
      font-size: 11px;
      color: var(--text-muted);
      opacity: 0.55;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0.02em;
      white-space: nowrap;
      &::before { content: '·'; margin-right: 8px; }
    }

    /* ── Department label ────────────── */
    .dept-label {
      font-size: 13px;
      color: var(--text-secondary);
      font-weight: 400;
      white-space: nowrap;
    }

    /* ── Location cell ───────────────── */
    .location-cell {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 13px;
      color: var(--text-muted);
      mat-icon { font-size: 13px; width: 13px; height: 13px; opacity: 0.5; }
    }

    /* ── Date cell ───────────────────── */
    .date-cell {
      font-size: 12.5px;
      color: var(--text-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }

    /* ── Status badges ───────────────── */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: 50px;
      white-space: nowrap;
      border: 1px solid transparent;
      background: rgba(255,255,255,0.03);
      color: var(--text-muted);
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }
    .status-label { line-height: 1; }

    .status-badge.status-active {
      color: #4ade80;
      background: rgba(34,197,94,0.08);
      border-color: rgba(34,197,94,0.18);
      .status-dot { box-shadow: 0 0 6px rgba(74,222,128,0.5); }
    }
    .status-badge.status-pending {
      color: #fbbf24;
      background: rgba(251,191,36,0.08);
      border-color: rgba(251,191,36,0.18);
    }
    .status-badge.status-on-leave {
      color: #60a5fa;
      background: rgba(96,165,250,0.08);
      border-color: rgba(96,165,250,0.18);
    }
    .status-badge.status-suspended {
      color: #f87171;
      background: rgba(248,113,113,0.08);
      border-color: rgba(248,113,113,0.18);
    }
    .status-badge.status-offline {
      color: #94a3b8;
      background: rgba(148,163,184,0.06);
      border-color: rgba(148,163,184,0.12);
    }
    .status-badge.status-inactive {
      color: #71717a;
      background: rgba(113,113,122,0.06);
      border-color: rgba(113,113,122,0.12);
    }

    /* ── Action buttons ──────────────── */
    .action-buttons {
      display: flex;
      gap: 4px;
      justify-content: flex-end;
      opacity: 0;
      transition: opacity 0.18s ease;
    }
    tr.mat-mdc-row:hover .action-buttons { opacity: 1; }

    .action-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      mat-icon { font-size: 17px; width: 17px; height: 17px; }
    }
    .edit-btn {
      color: var(--text-muted);
      &:hover {
        background: rgba(165,180,252,0.12) !important;
        color: #a5b4fc;
      }
    }
    .delete-btn {
      color: var(--text-muted);
      &:hover {
        background: rgba(248,113,113,0.12) !important;
        color: #f87171;
      }
      &[disabled] { opacity: 0.2; cursor: not-allowed; }
    }

    /* ── Responsive ──────────────────── */
    @media (max-width: 1024px) {
      .table-container { min-width: 680px; }
    }
    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 12px; }
      .header-buttons { width: 100%; justify-content: flex-end; }
      .filters-bar { flex-direction: column; }
      .search-field, .filter-field { width: 100%; }
      .filter-actions { width: 100%; justify-content: flex-end; }
    }
  `],
})
export class UserListComponent implements OnInit, AfterViewInit, OnDestroy {
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

  private usersService = inject(UserManagementService);
  public authService = inject(AuthService);
  private exportService = inject(ExportService);
  private dialog = inject(MatDialog);
  private notify = inject(NotificationService);
  private destroy$ = new Subject<void>();

  isLoading = signal(true);
  loadError = signal(false);
  deletingId = signal<string | null>(null);

  searchCtrl = new FormControl('');
  roleFilter = new FormControl('');
  statusFilter = new FormControl('');

  displayedColumns = ['name', 'department', 'role', 'status', 'officeLocation', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<User>([]);

  activeCount = signal(0);
  pendingCount = signal(0);
  adminCount = signal(0);

  ngOnInit(): void {
    this.loadUsers();
    this.setupFilters();
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.loadError.set(false);
    const filters = {
      search: this.searchCtrl.value || undefined,
      role: this.roleFilter.value || undefined,
      status: this.statusFilter.value || undefined,
    };

    this.usersService.getUsers(filters).subscribe({
      next: (users) => {
        this.dataSource.data = users;
        this.activeCount.set(users.filter((u) => u.status === 'active').length);
        this.pendingCount.set(users.filter((u) => u.status === 'pending').length);
        this.adminCount.set(users.filter((u) => u.role === 'admin').length);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set(true);
        this.notify.error('Failed to fetch employees.');
      },
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(UserFormComponent, {
      data: { mode: 'create' } as UserFormDialogData,
      panelClass: 'nsq-dialog',
      disableClose: true,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.usersService.createUser(result.formValue).subscribe({
        next: () => {
          this.notify.success('Employee created successfully');
          this.loadUsers();
        },
        error: (err) => {
          this.notify.error(err.error?.message ?? 'Failed to create employee');
        },
      });
    });
  }

  openEditDialog(user: User): void {
    const ref = this.dialog.open(UserFormComponent, {
      data: { mode: 'edit', user } as UserFormDialogData,
      panelClass: 'nsq-dialog',
      disableClose: true,
    });

    ref.afterClosed().subscribe((result) => {
      if (!result) return;
      this.usersService.updateUser(user.id, result.formValue).subscribe({
        next: () => {
          this.notify.success('Employee updated successfully');
          this.loadUsers();
        },
        error: (err) => {
          this.notify.error(err.error?.message ?? 'Failed to update employee');
        },
      });
    });
  }

  confirmDelete(user: User): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Remove Employee',
        message: `Are you sure you want to remove "${user.name}" from the system? This action cannot be undone.`,
        confirmLabel: 'Remove',
        cancelLabel: 'Cancel',
        danger: true,
      },
      panelClass: 'nsq-dialog',
    });

    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.deletingId.set(user.id);

      this.usersService.deleteUser(user.id).subscribe({
        next: () => {
          this.deletingId.set(null);
          this.notify.warning(`"${user.name}" has been removed.`);
          this.loadUsers();
        },
        error: (err) => {
          this.deletingId.set(null);
          this.notify.error(err.error?.message ?? 'Failed to remove employee');
        },
      });
    });
  }

  clearFilters(): void {
    this.searchCtrl.setValue('');
    this.roleFilter.setValue('');
    this.statusFilter.setValue('');
    this.loadUsers();
  }

  trackById(index: number, item: User): string {
    return item.id;
  }

  getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarIndex(name: string): number {
    // Deterministic color from name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash) % 8;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'pending': 'Pending',
      'on-leave': 'On Leave',
      'suspended': 'Suspended',
      'offline': 'Offline',
    };
    return labels[status] ?? status;
  }

  exportCSV(): void {
    const rawData = this.dataSource.data;
    const headers = ['Name', 'Email', 'Department', 'Role', 'Status', 'Location', 'Joined Date'];
    const keys = ['name', 'email', 'department', 'role', 'status', 'officeLocation', 'createdAt'];
    this.exportService.exportToCsv(rawData, 'nsqtech_employees', headers, keys);
  }

  exportPDF(): void {
    const rawData = this.dataSource.data;
    const headers = ['Name', 'Email', 'Department', 'Role', 'Status', 'Joined'];
    const keys = ['name', 'email', 'department', 'role', 'status', 'createdAt'];
    this.exportService.exportToPdf(rawData, 'nsqtech_employees', 'Employee Directory Report', headers, keys);
  }

  private setupFilters(): void {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadUsers());

    this.roleFilter.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers());

    this.statusFilter.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => this.loadUsers());
  }
}

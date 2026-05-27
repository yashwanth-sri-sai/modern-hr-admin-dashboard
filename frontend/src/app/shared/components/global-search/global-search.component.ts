import { Component, OnInit, OnDestroy, ElementRef, HostListener, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, forkJoin, catchError, of, map } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader.component';
import { Record } from '../../models/api-response.model';
import { ActivityLog } from '../../models/activity.model';
import { environment } from '../../../../environments/environment';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'User' | 'Record' | 'Activity Log';
  rawData: any;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatDialogModule,
    SkeletonLoaderComponent,
  ],
  template: `
    <div class="search-container">
      <div class="search-input-wrapper" [class.focused]="isFocused()">
        <mat-icon class="search-icon">search</mat-icon>
        <input
          [formControl]="searchControl"
          type="text"
          placeholder="Global search (press '/' to focus)..."
          (focus)="onFocus()"
          #searchInput
        />
        <button
          *ngIf="searchControl.value"
          class="clear-btn"
          (click)="clearSearch()"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Results Dropdown Overlay -->
      <div class="search-results-overlay" *ngIf="isOpen() && searchControl.value">
        @if (loading()) {
          <div class="search-loader-skeleton">
            <app-skeleton-loader [count]="3" variant="timeline" gap="8px" />
          </div>
        } @else if (hasResults()) {
          <div class="results-scroll-area">
            @for (group of groupedResults(); track group.category) {
              <div class="results-group">
                <div class="group-header">{{ group.category }}s</div>
                @for (item of group.items; track item.id) {
                  <div class="result-item" (click)="selectResult(item)">
                    <mat-icon class="item-icon">{{ getIcon(item.category) }}</mat-icon>
                    <div class="item-details">
                      <p class="item-title" [innerHTML]="highlightText(item.title)"></p>
                      <p class="item-subtitle" [innerHTML]="highlightText(item.subtitle)"></p>
                    </div>
                    <span class="go-indicator"><mat-icon>arrow_forward</mat-icon></span>
                  </div>
                }
              </div>
            }
          </div>
        } @else {
          <div class="no-results">
            <mat-icon>search_off</mat-icon>
            <p>No matches found for <strong>"{{ searchControl.value }}"</strong></p>
            <span class="no-results-hint">Try adjusting keywords or check spelling.</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
      width: 320px;
      max-width: 100%;
      z-index: 500;
    }
    .search-input-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid var(--border);
      border-radius: 50px;
      padding: 6px 16px;
      transition: all 0.2s ease;
      
      .search-icon {
        color: var(--text-muted);
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      input {
        background: transparent;
        border: none;
        outline: none;
        color: var(--text-primary);
        font-size: 13px;
        width: 100%;
        padding: 0;
        &::placeholder { color: var(--text-muted); }
      }
      .clear-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0;
        display: flex;
        align-items: center;
        color: var(--text-muted);
        &:hover { color: var(--text-primary); }
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
      
      &.focused {
        background: rgba(255, 255, 255, 0.05);
        border-color: var(--accent);
        box-shadow: 0 0 12px rgba(124, 137, 255, 0.15);
      }
    }

    .search-results-overlay {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
      backdrop-filter: blur(12px);
      max-height: 400px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .search-loader-skeleton {
      padding: 12px 8px;
    }

    .results-scroll-area {
      overflow-y: auto;
      padding: 8px 0;
    }

    .results-group {
      margin-bottom: 8px;
      &:last-child { margin-bottom: 0; }
    }

    .group-header {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 6px 16px;
      letter-spacing: 0.5px;
    }

    .result-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      cursor: pointer;
      transition: background 0.15s ease;
      
      &:hover {
        background: rgba(124, 137, 255, 0.08);
        .go-indicator {
          transform: translateX(3px);
          opacity: 1;
        }
      }
      
      .item-icon {
        color: var(--text-muted);
        font-size: 18px;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }
      
      .item-details {
        flex: 1;
        overflow: hidden;
        
        p { margin: 0; }
        .item-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .item-subtitle {
          font-size: 11px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      
      .go-indicator {
        color: var(--accent);
        opacity: 0;
        transition: all 0.2s ease;
        mat-icon { font-size: 16px; width: 16px; height: 16px; }
      }
    }

    .no-results {
      padding: 32px 16px;
      text-align: center;
      color: var(--text-muted);
      
      mat-icon {
        font-size: 32px;
        width: 32px;
        height: 32px;
        margin-bottom: 8px;
      }
      p { margin: 0; font-size: 13px; }
      .no-results-hint {
        display: block;
        margin-top: 6px;
        font-size: 11px;
        opacity: 0.85;
      }
    }

    ::ng-html-inserted mark {
      background: rgba(99, 102, 241, 0.25);
      color: #818cf8;
      border-radius: 2px;
      padding: 0 1px;
    }
  `],
})
export class GlobalSearchComponent implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  isFocused = signal(false);
  isOpen = signal(false);
  loading = signal(false);
  results = signal<SearchResult[]>([]);

  hasResults = computed(() => this.results().length > 0);

  groupedResults = computed(() => {
    const list = this.results();
    const categories: ('User' | 'Record' | 'Activity Log')[] = ['User', 'Record', 'Activity Log'];
    
    return categories
      .map(cat => ({
        category: cat,
        items: list.filter(i => i.category === cat)
      }))
      .filter(g => g.items.length > 0);
  });

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen.set(false);
      this.isFocused.set(false);
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent): void {
    // Focus search bar on '/' keypress if not inside an input/textarea
    const activeEl = document.activeElement?.tagName;
    if (event.key === '/' && activeEl !== 'INPUT' && activeEl !== 'TEXTAREA') {
      event.preventDefault();
      const input = this.elementRef.nativeElement.querySelector('input');
      input?.focus();
    }
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((query) => {
        if (query && query.trim().length >= 2) {
          this.executeSearch(query.trim());
        } else {
          this.results.set([]);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFocus(): void {
    this.isFocused.set(true);
    this.isOpen.set(true);
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.results.set([]);
    this.isOpen.set(false);
  }

  private executeSearch(query: string): void {
    this.loading.set(true);
    const isAdmin = this.authService.isAdmin();

    // Group parallel API requests
    const requests: { [key: string]: any } = {
      records: this.http.get<{ data: Record[] }>(`${environment.apiUrl}/records`).pipe(
        map(res => res.data),
        catchError(() => of([]))
      ),
      activities: this.http.get<{ data: ActivityLog[] }>(`${environment.apiUrl}/activity`).pipe(
        map(res => res.data),
        catchError(() => of([]))
      )
    };

    if (isAdmin) {
      requests['users'] = this.http.get<{ data: any[] }>(`${environment.apiUrl}/users`).pipe(
        map(res => res.data),
        catchError(() => of([]))
      );
    }

    forkJoin(requests).subscribe({
      next: (res: any) => {
        const queryLower = query.toLowerCase();
        const searchResults: SearchResult[] = [];

        // 1. Map Records
        if (res.records) {
          const matchedRecords = res.records.filter((r: Record) =>
            r.title.toLowerCase().includes(queryLower) ||
            r.category.toLowerCase().includes(queryLower) ||
            r.assignedTo.toLowerCase().includes(queryLower)
          );
          matchedRecords.forEach((r: Record) => {
            searchResults.push({
              id: r.id,
              title: r.title,
              subtitle: `Category: ${r.category} | Assigned: ${r.assignedTo} | Status: ${r.status}`,
              category: 'Record',
              rawData: r
            });
          });
        }

        // 2. Map Activities
        if (res.activities) {
          const matchedActs = res.activities.filter((a: ActivityLog) =>
            a.description.toLowerCase().includes(queryLower) ||
            (a.username && a.username.toLowerCase().includes(queryLower)) ||
            a.action.toLowerCase().includes(queryLower)
          );
          matchedActs.forEach((a: ActivityLog) => {
            searchResults.push({
              id: a.id,
              title: a.description,
              subtitle: `Logged by ${a.username || 'System'} | ${new Date(a.timestamp).toLocaleString()}`,
              category: 'Activity Log',
              rawData: a
            });
          });
        }

        // 3. Map Users (Admin Only)
        if (res.users) {
          const matchedUsers = res.users.filter((u: any) =>
            u.name.toLowerCase().includes(queryLower) ||
            u.email.toLowerCase().includes(queryLower) ||
            u.department.toLowerCase().includes(queryLower) ||
            u.role.toLowerCase().includes(queryLower)
          );
          matchedUsers.forEach((u: any) => {
            searchResults.push({
              id: u.id,
              title: u.name,
              subtitle: `Email: ${u.email} | Dept: ${u.department} | Role: ${u.role === 'admin' ? 'Admin' : 'User'}`,
              category: 'User',
              rawData: u
            });
          });
        }

        this.results.set(searchResults.slice(0, 15)); // Cap at top 15 results
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getIcon(cat: 'User' | 'Record' | 'Activity Log'): string {
    switch (cat) {
      case 'User': return 'person';
      case 'Record': return 'assignment';
      case 'Activity Log': return 'history';
    }
  }

  highlightText(text: string): string {
    const query = this.searchControl.value;
    if (!query) return text;
    
    // Escape regex characters
    const escapedQuery = query.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  selectResult(item: SearchResult): void {
    this.isOpen.set(false);

    // If User result, and user is admin, navigate to admin page
    if (item.category === 'User') {
      this.router.navigate(['/app/admin'], { queryParams: { search: item.title } });
    } else if (item.category === 'Record') {
      // Show record details in a quick read-only dialog
      this.showDetailDialog(item);
    } else if (item.category === 'Activity Log') {
      // Just show details popup
      this.showDetailDialog(item);
    }
  }

  private showDetailDialog(item: SearchResult): void {
    this.dialog.open(SearchDetailDialog, {
      width: '450px',
      data: item
    });
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Inner Helper Detail Dialog
   ───────────────────────────────────────────────────────────────────────────── */
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'search-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title class="dialog-header">
      <mat-icon>{{ getIcon() }}</mat-icon>
      <span>{{ data.category }} Details</span>
    </h2>
    <mat-dialog-content class="dialog-body">
      <div class="detail-field">
        <span class="label">Title / Name</span>
        <span class="value">{{ data.title }}</span>
      </div>
      
      <!-- Records fields -->
      <ng-container *ngIf="data.category === 'Record'">
        <div class="row-fields">
          <div class="detail-field">
            <span class="label">Category</span>
            <span class="value badge category">{{ data.rawData.category }}</span>
          </div>
          <div class="detail-field">
            <span class="label">Priority</span>
            <span class="value badge" [class]="'priority-' + data.rawData.priority">{{ data.rawData.priority }}</span>
          </div>
        </div>
        <div class="row-fields">
          <div class="detail-field">
            <span class="label">Assigned To</span>
            <span class="value">{{ data.rawData.assignedTo }}</span>
          </div>
          <div class="detail-field">
            <span class="label">Status</span>
            <span class="value badge" [class]="'status-' + data.rawData.status">{{ data.rawData.status }}</span>
          </div>
        </div>
        <div class="detail-field">
          <span class="label">Created Date</span>
          <span class="value">{{ data.rawData.createdAt | date:'medium' }}</span>
        </div>
      </ng-container>

      <!-- Activity logs fields -->
      <ng-container *ngIf="data.category === 'Activity Log'">
        <div class="row-fields">
          <div class="detail-field">
            <span class="label">Triggered By</span>
            <span class="value">{{ data.rawData.username || 'System' }}</span>
          </div>
          <div class="detail-field">
            <span class="label">Action Type</span>
            <span class="value badge action">{{ data.rawData.action }}</span>
          </div>
        </div>
        <div class="row-fields">
          <div class="detail-field">
            <span class="label">Status</span>
            <span class="value badge" [class]="data.rawData.status">{{ data.rawData.status }}</span>
          </div>
          <div class="detail-field">
            <span class="label">IP Address</span>
            <span class="value">{{ data.rawData.ipAddress || 'Internal' }}</span>
          </div>
        </div>
        <div class="detail-field">
          <span class="label">Timestamp</span>
          <span class="value">{{ data.rawData.timestamp | date:'medium' }}</span>
        </div>
      </ng-container>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
      color: var(--text-primary);
      mat-icon { color: #818cf8; }
    }
    .dialog-body {
      padding: 16px 0 !important;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .detail-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
      .label {
        font-size: 11px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .value {
        font-size: 13.5px;
        color: var(--text-primary);
        font-weight: 500;
      }
    }
    .row-fields {
      display: flex;
      gap: 16px;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10.5px;
      font-weight: 600;
      text-transform: capitalize;
      width: fit-content;
      
      &.category { background: rgba(124, 137, 255, 0.08); color: var(--accent); }
      &.action { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); color: var(--text-secondary); }
      &.success { background: rgba(34, 197, 94, 0.08); color: var(--success); }
      &.failure { background: rgba(239, 68, 68, 0.08); color: var(--danger); }
      
      &.priority-low { background: rgba(255, 255, 255, 0.03); color: var(--text-muted); }
      &.priority-medium { background: rgba(245, 158, 11, 0.08); color: var(--warning); }
      &.priority-high { background: rgba(249, 115, 22, 0.08); color: #fb923c; }
      &.priority-critical { background: rgba(239, 68, 68, 0.08); color: var(--danger); }

      &.status-completed { background: rgba(34, 197, 94, 0.08); color: var(--success); }
      &.status-in-progress { background: rgba(99, 102, 241, 0.08); color: var(--accent); }
      &.status-pending { background: rgba(245, 158, 11, 0.08); color: var(--warning); }
    }
  `]
})
export class SearchDetailDialog {
  constructor(@Inject(MAT_DIALOG_DATA) public data: SearchResult) {}

  getIcon(): string {
    switch (this.data.category) {
      case 'User': return 'person';
      case 'Record': return 'assignment';
      case 'Activity Log': return 'history';
    }
  }
}

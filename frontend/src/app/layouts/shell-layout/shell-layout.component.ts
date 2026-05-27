import { Component, computed, inject, OnInit, OnDestroy, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { NotificationService } from '../../core/services/notification.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { LoadingService } from '../../core/services/loading.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiHealthService } from '../../core/services/api-health.service';
import { SessionTimeoutService } from '../../core/services/session-timeout.service';
import { ActivityService } from '../../core/services/activity.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { GlobalSearchComponent } from '../../shared/components/global-search/global-search.component';
import { BreadcrumbComponent } from '../../shared/components/breadcrumb/breadcrumb.component';
import { ActivityLog } from '../../shared/models/activity.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CommandPaletteComponent } from '../../shared/components/command-palette/command-palette.component';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-shell-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatIconModule, MatButtonModule, MatTooltipModule, MatMenuModule, MatDialogModule,
    MatDividerModule, MatBadgeModule, CommonModule, SpinnerComponent, GlobalSearchComponent, BreadcrumbComponent,
  ],
  template: `
    <div class="shell">
      <app-spinner variant="bar" [overlay]="loadingService.isLoading()" />

      <div
        class="sidebar-backdrop"
        [class.visible]="mobileNavOpen"
        (click)="closeMobileNav()"
        aria-hidden="true"
      ></div>

      <!-- Sidebar -->
      <aside
        class="sidebar"
        [class.collapsed]="sidebarCollapsed && !mobileNavOpen"
        [class.mobile-open]="mobileNavOpen"
      >
        <div class="sidebar-header">
          <div class="brand">
            <div class="brand-icon">N</div>
            @if (!sidebarCollapsed) {
              <span class="brand-text">NSQTech</span>
            }
          </div>
          <button mat-icon-button class="collapse-btn" (click)="toggleSidebar()">
            <mat-icon>{{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of visibleNavItems(); track item.route) {
            <a
              [routerLink]="item.route"
              routerLinkActive="active"
              class="nav-item"
              [matTooltip]="sidebarCollapsed && !mobileNavOpen ? item.label : ''"
              matTooltipPosition="right"
              (click)="closeMobileNav()"
            >
              <span class="nav-active-bar" aria-hidden="true"></span>
              <mat-icon class="nav-icon">{{ item.icon }}</mat-icon>
              @if (!sidebarCollapsed) {
                <span class="nav-label">{{ item.label }}</span>
              }
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" [class.compact]="sidebarCollapsed">
            <div class="user-avatar">
              {{ userInitials() }}
            </div>
            @if (!sidebarCollapsed) {
              <div class="user-details">
                <p class="user-name">{{ authService.currentUser()?.name }}</p>
                <p class="user-role">{{ authService.currentUser()?.role === 'admin' ? 'Administrator' : 'General User' }}</p>
              </div>
            }
          </div>
        </div>
      </aside>

      <!-- Main content area -->
      <div class="main-area">
        <!-- Topbar -->
        <header class="topbar">
          <div class="topbar-left">
            <button
              mat-icon-button
              class="mobile-menu-btn"
              (click)="toggleMobileNav()"
              aria-label="Open navigation menu"
            >
              <mat-icon>menu</mat-icon>
            </button>
            
            <app-breadcrumb></app-breadcrumb>

            <div class="search-wrapper">
              <app-global-search />
            </div>
          </div>
          <div class="topbar-right">
            <!-- API Status Indicator -->
            <button
              type="button"
              class="api-status"
              [class]="apiHealthService.status()"
              (click)="onApiStatusClick()"
              [matTooltip]="apiHealthService.status() === 'connected' ? 'System online — click to refresh' : apiHealthService.status() === 'offline' ? 'API offline — click to retry' : 'Checking API status...'"
            >
              <span class="status-dot"></span>
              <span class="status-text">{{ apiHealthService.status() === 'connected' ? 'System Online' : apiHealthService.status() === 'offline' ? 'API Offline' : 'Checking...' }}</span>
            </button>

            <!-- Notification Bell -->
            <button
              mat-icon-button
              [matMenuTriggerFor]="notificationMenu"
              class="notification-btn"
              [matBadge]="unreadCount()"
              matBadgeColor="warn"
              [matBadgeDisabled]="unreadCount() === 0"
              matTooltip="Recent notifications"
            >
              <mat-icon>notifications</mat-icon>
            </button>
            
            <mat-menu #notificationMenu="matMenu" class="notification-dropdown">
              <div class="notif-header">
                <span>Recent Activities</span>
                <button mat-button class="clear-btn" (click)="clearNotifications()" *ngIf="notifications().length">Dismiss</button>
              </div>
              <mat-divider />
              <div class="notif-list">
                @if (notifications().length === 0) {
                  <div class="notif-empty">
                    <mat-icon>notifications_none</mat-icon>
                    <span>No notifications yet</span>
                    <p class="notif-hint">Activity from your workspace will appear here.</p>
                  </div>
                } @else {
                  @for (n of notifications(); track n.id) {
                    <div class="notif-item">
                      <mat-icon [style.color]="getNotifColor(n.action)" class="notif-icon">{{ getNotifIcon(n.action) }}</mat-icon>
                      <div class="notif-details">
                        <p class="notif-desc">{{ n.description }}</p>
                        <span class="notif-time">{{ formatRelativeTime(n.timestamp) }}</span>
                      </div>
                    </div>
                  }
                }
              </div>
            </mat-menu>

            <!-- Theme Toggle -->
            <button
              mat-icon-button
              (click)="themeService.toggleTheme()"
              [matTooltip]="themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              class="theme-toggle-btn"
            >
              <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            <!-- User Menu Chip -->
            <div class="user-chip">
              <div class="chip-avatar">{{ userInitials() }}</div>
              <div class="chip-info">
                <span class="chip-name">{{ authService.currentUser()?.name }}</span>
                <span class="chip-dept">{{ authService.currentUser()?.department }}</span>
              </div>
              <button
                mat-icon-button
                [matMenuTriggerFor]="userMenu"
                class="menu-trigger"
              >
                <mat-icon>expand_more</mat-icon>
              </button>
            </div>

            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <div class="menu-header">
                <p class="menu-name">{{ authService.currentUser()?.name }}</p>
                <p class="menu-email">{{ authService.currentUser()?.email }}</p>
                <p class="menu-meta" *ngIf="authService.currentUser()?.lastLogin">
                  Last login: {{ authService.currentUser()?.lastLogin | date:'short' }}
                </p>
              </div>
              <mat-divider />
              <button mat-menu-item routerLink="/app/profile">
                <mat-icon>person</mat-icon>
                <span>My Profile</span>
              </button>
              <button mat-menu-item (click)="logout()">
                <mat-icon color="warn">logout</mat-icon>
                <span>Sign out</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Routed content -->
        <main class="content">
          <div class="route-page">
            <router-outlet (activate)="onRouteActivate()" />
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .shell {
      display: flex;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-primary);
    }

    /* ── Sidebar ─────────────────────────── */
    .sidebar {
      width: 260px;
      min-width: 260px;
      background: var(--bg-secondary);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      transition: width 0.2s cubic-bezier(0.4, 0, 0.2, 1), min-width 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      z-index: 100;
    }
    .sidebar.collapsed {
      width: 72px;
      min-width: 72px;
    }
    
    .sidebar-header {
      height: 72px;
      padding: 0 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      min-width: 36px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 16px;
    }
    .brand-text {
      font-size: 16px;
      font-weight: 700;
      color: var(--text-primary);
      white-space: nowrap;
    }
    .collapse-btn {
      color: var(--text-muted);
      flex-shrink: 0;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }
    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      margin-bottom: 4px;
      border-radius: var(--radius-sm);
      color: var(--text-muted);
      text-decoration: none;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      font-size: 14px;
      font-weight: 500;
    }
    .nav-active-bar { 
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%) scaleY(0);
      width: 3px;
      height: 16px;
      background: var(--accent);
      border-radius: 0 4px 4px 0;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.02);
      color: var(--text-primary);
    }
    .nav-item.active {
      color: var(--text-primary);
      background: rgba(255,255,255,0.05);
    }
    .nav-item.active .nav-active-bar {
      transform: translateY(-50%) scaleY(1);
    }
    .nav-item.active .nav-icon { color: var(--accent); }
    .nav-icon { font-size: 18px; width: 18px; height: 18px; flex-shrink: 0; }

    .sidebar-footer {
      padding: 12px 8px;
      border-top: 1px solid var(--border);
    }
    .user-info {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      border-radius: 10px;
      background: rgba(255,255,255,0.03);
    }
    .user-info.compact { justify-content: center; }
    .user-avatar {
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 13px;
      font-weight: 700;
    }
    .user-details { overflow: hidden; }
    .user-name {
      margin: 0;
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role { margin: 0; font-size: 11px; color: var(--text-muted); }

    /* ── Topbar ─────────────────────────── */
    .main-area {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .topbar {
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      background: transparent;
      border-bottom: 1px solid var(--border);
      flex-shrink: 0;
      z-index: 50;
    }
    .topbar-left {
      display: flex;
      align-items: center;
      gap: 20px;
      flex: 1;
    }
    .page-title {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .search-wrapper {
      max-width: 380px;
      width: 100%;
    }
    .topbar-right { display: flex; align-items: center; gap: 14px; }
    .theme-toggle-btn {
      color: var(--text-muted);
      transition: color 0.2s, transform 0.2s;
      &:hover {
        color: var(--accent);
        transform: rotate(20deg) scale(1.1);
      }
    }
    .notification-btn {
      color: var(--text-muted);
    }

    /* ── Notifications Dropdown ─────────── */
    .notification-dropdown {
      min-width: 320px;
      max-width: 320px;
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
    }
    .notif-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-primary);
      .clear-btn {
        height: 24px;
        line-height: 24px;
        font-size: 11px;
        padding: 0 8px;
        color: #818cf8;
      }
    }
    .notif-list {
      max-height: 280px;
      overflow-y: auto;
    }
    .notif-empty {
      padding: 24px 16px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      color: var(--text-muted);
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
      span { font-size: 12px; }
      .notif-hint {
        margin: 0;
        font-size: 11px;
        opacity: 0.8;
        max-width: 200px;
        line-height: 1.4;
      }
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      &:last-child { border-bottom: none; }
      &:hover { background: rgba(99, 102, 241, 0.04); }
      
      .notif-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin-top: 2px;
        flex-shrink: 0;
      }
      .notif-details {
        flex: 1;
        overflow: hidden;
      }
      .notif-desc {
        margin: 0 0 4px;
        font-size: 11.5px;
        color: var(--text-secondary);
        line-height: 1.4;
      }
      .notif-time {
        font-size: 10px;
        color: var(--text-muted);
      }
    }

    .mobile-menu-btn {
      display: none;
      color: var(--text-muted);
    }
    @media (max-width: 1150px) {
      .topbar {
        padding: 0 20px;
      }
      .search-wrapper {
        max-width: 220px;
      }
      .chip-info {
        display: none;
      }
      .status-text {
        display: none;
      }
    }
    @media (max-width: 900px) {
      .sidebar {
        position: fixed;
        left: 0;
        top: 0;
        bottom: 0;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .sidebar.mobile-open {
        transform: translateX(0);
        box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
      }
      .sidebar-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      .sidebar-backdrop.visible {
        opacity: 1;
        pointer-events: auto;
      }
      .mobile-menu-btn { display: inline-flex; }
      .search-wrapper { display: none; }
      .chip-info { display: none; }
      .status-text { display: none; }
      .topbar { padding: 0 16px; }
      .content { padding: 16px; }
    }

    .api-status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      border-radius: var(--radius-sm);
      background: var(--bg-primary);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(255,255,255,0.03);
      }
      
      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #94a3b8;
      }
      
      &.connected {
        color: var(--text-primary);
        .status-dot {
          background: var(--success);
        }
      }
      
      &.offline {
        color: var(--danger);
        .status-dot {
          background: var(--danger);
        }
      }
    }
    .user-chip {
      display: flex;
      align-items: center;
      gap: 10px;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: var(--radius-sm);
      padding: 4px 4px 4px 12px;
      transition: background 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: rgba(255,255,255,0.03);
      }
    }
    .chip-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover));
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 11px;
      font-weight: 700;
    }
    .chip-info { display: flex; flex-direction: column; }
    .chip-name { font-size: 13px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
    .chip-dept { font-size: 11px; color: var(--text-muted); line-height: 1.2; }
    .menu-trigger { color: var(--text-muted); }

    .user-dropdown {
      min-width: 200px;
    }
    .menu-header {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      
      .menu-name { margin: 0; font-size: 13.5px; font-weight: 700; color: var(--text-primary); }
      .menu-email { margin: 0; font-size: 11.5px; color: var(--text-muted); }
      .menu-meta { margin: 6px 0 0; font-size: 10px; color: var(--text-muted); }
    }

    /* ── Content ─────────────────────────── */
    .content {
      flex: 1;
      overflow-y: auto;
      padding: 40px;
    }
  `],
})
export class ShellLayoutComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  loadingService = inject(LoadingService);
  themeService = inject(ThemeService);
  apiHealthService = inject(ApiHealthService);
  private sessionTimeoutService = inject(SessionTimeoutService);
  private activityService = inject(ActivityService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  
  sidebarCollapsed = false;
  mobileNavOpen = false;
  routeState = signal('dashboard');
  notifications = signal<ActivityLog[]>([]);
  unreadCount = signal(0);

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.altKey && event.key.toLowerCase() === 'd') {
      event.preventDefault();
      this.router.navigate(['/app/dashboard']);
    }
  }

  ngOnInit(): void {
    this.sessionTimeoutService.startMonitoring();
    this.loadNotifications();
    this.syncRouteState();

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => this.syncRouteState());
  }

  onRouteActivate(): void {
    this.syncRouteState();
    this.closeMobileNav();
  }

  private syncRouteState(): void {
    const url = this.router.url;
    if (url.includes('admin')) {
      this.routeState.set('admin');
    } else {
      this.routeState.set('dashboard');
    }
  }

  ngOnDestroy(): void {
    // Clean up timers
    this.sessionTimeoutService.stopMonitoring();
  }

  loadNotifications(): void {
    this.activityService.getActivities().subscribe({
      next: (list) => {
        // Take the top 5 recent notifications
        this.notifications.set(list.slice(0, 5));
        this.unreadCount.set(list.filter(n => n.action !== 'login').length % 6 || 3); // realistic unread alerts mock
      },
      error: () => {}
    });
  }

  clearNotifications(): void {
    this.unreadCount.set(0);
    this.notifications.set([]);
  }

  getNotifIcon(action: string): string {
    switch (action) {
      case 'login': return 'login';
      case 'logout': return 'logout';
      case 'user_create': return 'person_add';
      case 'user_delete': return 'person_remove';
      case 'user_role_update': return 'admin_panel_settings';
      case 'login_failed': return 'gpp_bad';
      case 'record_update': return 'assignment';
      default: return 'info';
    }
  }

  getNotifColor(action: string): string {
    switch (action) {
      case 'login': return 'var(--success)';
      case 'logout': return 'var(--accent)';
      case 'user_create': return 'var(--accent-hover)';
      case 'user_delete': return 'var(--danger)';
      case 'user_role_update': return 'var(--warning)';
      case 'login_failed': return 'var(--danger)';
      case 'record_update': return 'var(--success)';
      default: return 'var(--text-muted)';
    }
  }

  formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  private readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/app/dashboard' },
    { icon: 'manage_accounts', label: 'User Management', route: '/app/admin', adminOnly: true },
    { icon: 'history', label: 'Audit Log Trail', route: '/app/audit-logs', adminOnly: true },
  ];

  visibleNavItems = computed(() => {
    const isAdmin = this.authService.isAdmin();
    return this.navItems.filter((item) => !item.adminOnly || isAdmin);
  });

  userInitials = computed(() => {
    const name = this.authService.currentUser()?.name ?? '';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  });

  pageTitle = computed(() => {
    if (this.routeState() === 'admin') return 'User Management';
    return 'Dashboard';
  });

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  @HostListener('document:keydown', ['$event'])
  handleGlobalShortcuts(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openCommandPalette();
    }
  }

  openCommandPalette() {
    this.dialog.open(CommandPaletteComponent, {
      width: '600px',
      maxWidth: '90vw',
      panelClass: 'command-palette-dialog',
      position: { top: '10vh' }
    });
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  onApiStatusClick(): void {
    this.apiHealthService.checkImmediately();
    if (this.apiHealthService.status() === 'offline') {
      this.notify.info('Checking API connection…');
    }
  }

  logout(): void {
    this.authService.logout();
    this.notify.success('Signed out successfully');
  }
}

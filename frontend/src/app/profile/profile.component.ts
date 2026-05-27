import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { NotificationService } from '../core/services/notification.service';
import { RoleLabelPipe } from '../shared/pipes/role-label.pipe';
import { fadeAnimation } from '../shared/animations';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTabsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    RoleLabelPipe
  ],
  animations: [fadeAnimation],
  template: `
    <div class="profile-page" @fadeAnimation>
      <!-- Hero Section -->
      <div class="profile-hero">
        <div class="hero-banner"></div>
        <div class="hero-body">
          <div class="avatar-container">
            <div class="avatar-circle">
              <img *ngIf="user?.avatar" [src]="user?.avatar" alt="Avatar" class="avatar-img" />
              <span *ngIf="!user?.avatar" class="avatar-initials">{{ userInitials() }}</span>
              
              <label class="avatar-upload-overlay" for="avatar-input" title="Upload avatar">
                <mat-icon>photo_camera</mat-icon>
                <span>Change</span>
              </label>
            </div>
            <input id="avatar-input" type="file" (change)="onAvatarSelected($event)" accept="image/*" style="display: none" />
            <button *ngIf="user?.avatar" mat-button class="remove-avatar-btn" (click)="removeAvatar()" title="Remove Avatar">
              <mat-icon>delete</mat-icon> Remove
            </button>
          </div>

          <div class="hero-details">
            <div class="hero-title-row">
              <h1>{{ user?.name }}</h1>
              <span class="nsq-chip nsq-status-completed active">
                <span class="status-dot"></span> Active
              </span>
              <span class="nsq-role-badge" [class.admin]="user?.role === 'admin'">
                {{ (user?.role || '') | roleLabel }}
              </span>
            </div>
            
            <div class="hero-meta-row">
              <span class="meta-item"><mat-icon>badge</mat-icon> {{ user?.employeeId || 'EMP-1001' }}</span>
              <span class="meta-divider">|</span>
              <span class="meta-item"><mat-icon>domain</mat-icon> {{ user?.department || 'Human Resources' }}</span>
              <span class="meta-divider">|</span>
              <span class="meta-item"><mat-icon>calendar_today</mat-icon> Joined {{ (user?.joinDate | date:'mediumDate') || (user?.createdAt | date:'mediumDate') || 'Jan 15, 2024' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="profile-layout-grid">
        <!-- Left Main Column: Tab Views -->
        <div class="profile-main-column">
          <div class="tabs-card">
            <mat-tab-group animationDuration="200ms" class="premium-tabs">
              <!-- Tab 1: Account Information -->
              <mat-tab label="Account Details">
                <div class="tab-content">
                  @if (!isEditing) {
                    <div class="details-grid">
                      <div class="info-group">
                        <span class="info-label">Full Name</span>
                        <span class="info-value">{{ user?.name }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Email Address</span>
                        <span class="info-value">{{ user?.email }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Phone Number</span>
                        <span class="info-value">{{ user?.phone || '+91 98450 12345' }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Department</span>
                        <span class="info-value">{{ user?.department || 'Human Resources' }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Office Location</span>
                        <span class="info-value">{{ user?.officeLocation || 'Hyderabad' }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Reporting Manager</span>
                        <span class="info-value">{{ user?.reportingManager || 'Executive Board' }}</span>
                      </div>
                      <div class="info-group">
                        <span class="info-label">Employee ID</span>
                        <span class="info-value">{{ user?.employeeId || 'EMP-1001' }}</span>
                      </div>
                    </div>
                    <div class="details-actions">
                      <button mat-flat-button color="primary" (click)="startEditing()">
                        <mat-icon>edit</mat-icon> Edit Profile Details
                      </button>
                    </div>
                  } @else {
                    <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="edit-form">
                      <div class="form-grid">
                        <mat-form-field appearance="outline">
                          <mat-label>Full Name</mat-label>
                          <input matInput formControlName="name" required />
                          <mat-error *ngIf="profileForm.get('name')?.hasError('required')">Name is required</mat-error>
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Phone Number</mat-label>
                          <input matInput formControlName="phone" placeholder="+91 98450 12345" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Office Location</mat-label>
                          <input matInput formControlName="officeLocation" placeholder="Hyderabad" />
                        </mat-form-field>

                        <mat-form-field appearance="outline">
                          <mat-label>Department</mat-label>
                          <input matInput formControlName="department" required />
                          <mat-error *ngIf="profileForm.get('department')?.hasError('required')">Department is required</mat-error>
                        </mat-form-field>
                      </div>

                      <div class="form-actions">
                        <button type="button" mat-stroked-button (click)="cancelEditing()" [disabled]="isSaving">Cancel</button>
                        <button type="submit" mat-flat-button color="primary" [disabled]="profileForm.invalid || isSaving">
                          @if (isSaving) {
                            <mat-spinner diameter="18" class="btn-spinner"></mat-spinner>
                            <span>Saving...</span>
                          } @else {
                            <ng-container>
                              <mat-icon>save</mat-icon>
                              <span>Save Changes</span>
                            </ng-container>
                          }
                        </button>
                      </div>
                    </form>
                  }
                </div>
              </mat-tab>

              <!-- Tab 2: Preferences -->
              <mat-tab label="Preferences">
                <div class="tab-content">
                  <div class="preferences-list">
                    <div class="preference-item">
                      <div class="pref-info">
                        <span class="pref-title">Dark Mode Theme</span>
                        <span class="pref-desc">Switch between light and dark interface visuals</span>
                      </div>
                      <mat-slide-toggle [checked]="themeService.isDarkMode()" (change)="themeService.toggleTheme()"></mat-slide-toggle>
                    </div>

                    <div class="preference-item">
                      <div class="pref-info">
                        <span class="pref-title">Email Security Digests</span>
                        <span class="pref-desc">Receive weekly audit logs and alerts on unauthorized logins</span>
                      </div>
                      <mat-slide-toggle [(ngModel)]="prefEmailAlerts" (change)="savePreferences()"></mat-slide-toggle>
                    </div>

                    <div class="preference-item">
                      <div class="pref-info">
                        <span class="pref-title">Real-time Activity Warnings</span>
                        <span class="pref-desc">Receive in-app banner alerts for sensitive metadata adjustments</span>
                      </div>
                      <mat-slide-toggle [(ngModel)]="prefActivityAlerts" (change)="savePreferences()"></mat-slide-toggle>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- Tab 3: Security & Sessions -->
              <mat-tab label="Security & Sessions">
                <div class="tab-content">
                  <div class="security-timeline">
                    <h4>Active Workspace Sessions</h4>
                    <p class="sub-sec-desc">These devices are currently authenticated to your NSQTech account.</p>
                    
                    <div class="sessions-list">
                      <div class="session-device-item">
                        <mat-icon class="device-icon">computer</mat-icon>
                        <div class="device-details">
                          <div class="device-name-row">
                            <span class="device-name">Chrome on Windows (Current Session)</span>
                            <span class="session-badge active">Active Now</span>
                          </div>
                          <span class="device-meta">IP: 192.168.1.72 • Last active: Just now</span>
                        </div>
                      </div>

                      <div class="session-device-item">
                        <mat-icon class="device-icon">smartphone</mat-icon>
                        <div class="device-details">
                          <div class="device-name-row">
                            <span class="device-name">Safari on iOS (iPhone 16 Pro)</span>
                            <span class="session-badge">Active</span>
                          </div>
                          <span class="device-meta">IP: 172.56.21.90 • Last active: 2 hours ago</span>
                        </div>
                      </div>
                    </div>

                    <mat-divider style="margin: 24px 0"></mat-divider>

                    <h4>Account Protection Control</h4>
                    <div class="security-actions-card">
                      <div class="security-info-text">
                        <span class="sec-label">Inactivity Sign-Out Guard</span>
                        <span class="sec-value">Your session automatically terminates after 5 minutes of inactivity.</span>
                      </div>
                      <button mat-stroked-button color="warn" (click)="triggerPasswordReset()">
                        <mat-icon>key</mat-icon> Reset Password
                      </button>
                    </div>
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </div>
        </div>

        <!-- Right Side: Overview Cards & Quick Actions -->
        <div class="profile-sidebar-column">
          <!-- Stats Panel -->
          <div class="overview-section">
            <h3>Overview Stats</h3>
            <div class="overview-metric-cards">
              <!-- Card 1: Account Status -->
              <div class="overview-metric-card">
                <div class="metric-header">
                  <mat-icon class="metric-icon text-emerald">check_circle</mat-icon>
                  <span class="metric-label">Status</span>
                </div>
                <p class="metric-val">Active</p>
                <span class="metric-trend text-success">Compliance verified</span>
              </div>

              <!-- Card 2: Permissions -->
              <div class="overview-metric-card">
                <div class="metric-header">
                  <mat-icon class="metric-icon text-indigo">lock</mat-icon>
                  <span class="metric-label">Access Level</span>
                </div>
                <p class="metric-val">{{ user?.role === 'admin' ? 'Full Admin' : 'Write Access' }}</p>
                <span class="metric-trend">{{ user?.role === 'admin' ? 'Total tenant permissions' : 'Limited view/edit' }}</span>
              </div>

              <!-- Card 3: Total Actions Logged -->
              <div class="overview-metric-card">
                <div class="metric-header">
                  <mat-icon class="metric-icon text-violet">history</mat-icon>
                  <span class="metric-label">Events Audited</span>
                </div>
                <p class="metric-val">248</p>
                <span class="metric-trend">Activity trail verified</span>
              </div>

              <!-- Card 4: Last Active Session -->
              <div class="overview-metric-card">
                <div class="metric-header">
                  <mat-icon class="metric-icon text-amber">login</mat-icon>
                  <span class="metric-label">Last Login</span>
                </div>
                <p class="metric-val text-sm">{{ (user?.lastLogin | date:'shortTime') || 'Just now' }}</p>
                <span class="metric-trend">{{ (user?.lastLogin | date:'mediumDate') || 'Today' }}</span>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions-panel" style="margin-top: 24px">
            <h3>Quick Controls</h3>
            <div class="action-grid">
              <button mat-button class="action-card" (click)="startEditing()">
                <mat-icon>edit</mat-icon>
                <span>Edit Profile</span>
              </button>
              <button mat-button class="action-card" (click)="triggerPasswordReset()">
                <mat-icon>key</mat-icon>
                <span>Reset Password</span>
              </button>
              <button mat-button class="action-card" (click)="logout()">
                <mat-icon color="warn">logout</mat-icon>
                <span style="color: var(--danger);">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-page {
      display: flex;
      flex-direction: column;
      gap: 24px;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }
    
    /* ─── Hero Section ─── */
    .profile-hero {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .hero-banner {
      height: 100px;
      background: linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.03) 100%);
      border-bottom: 1px solid var(--border);
    }
    .hero-body {
      padding: 24px 32px;
      display: flex;
      gap: 24px;
      align-items: center;
      margin-top: -40px;
    }
    
    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: relative;
      z-index: 10;
    }
    .avatar-circle {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      background: var(--bg-elevated);
      border: 4px solid var(--bg-secondary);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
    }
    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-initials {
      font-size: 32px;
      font-weight: 700;
      color: var(--text-primary);
    }
    .avatar-upload-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
      cursor: pointer;
      font-size: 10px;
      font-weight: 500;
      mat-icon { font-size: 20px; width: 20px; height: 20px; margin-bottom: 2px; }
    }
    .avatar-circle:hover .avatar-upload-overlay {
      opacity: 1;
    }
    .remove-avatar-btn {
      font-size: 11px;
      height: 24px;
      line-height: 24px;
      padding: 0 8px;
      color: var(--text-muted);
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }

    .hero-details {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-top: 30px;
    }
    .hero-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--text-primary);
      }
    }
    /* Centralized role-badge and status chip styling moved to global stylesheet */
    .status-dot {
      width: 6px;
      height: 6px;
      background-color: var(--success);
      border-radius: 50%;
      box-shadow: 0 0 6px var(--success);
    }
    .hero-meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
      flex-wrap: wrap;
    }
    .meta-divider {
      color: var(--border);
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
      mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--text-muted); }
    }

    /* ─── Grid Layout ─── */
    .profile-layout-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 280px;
      gap: 24px;
      align-items: start;
    }
    .profile-sidebar-column {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .overview-section h3,
    .quick-actions-panel h3 {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin: 0 0 12px 0;
    }
    .overview-metric-cards {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .overview-metric-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.01), 0 2px 6px rgba(0,0,0,0.15);
      transition: all 0.2s ease;
      &:hover {
        transform: translateY(-1px);
        border-color: rgba(255, 255, 255, 0.1);
      }
    }
    .metric-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .metric-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
      &.text-emerald { color: var(--success); }
      &.text-indigo { color: var(--accent); }
      &.text-violet { color: var(--accent-hover); }
      &.text-amber { color: var(--warning); }
    }
    .metric-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-val {
      font-size: 18px;
      font-weight: 700;
      margin: 8px 0 2px 0;
      color: var(--text-primary);
      line-height: 1.1;
      &.text-sm { font-size: 13px; font-family: monospace; }
    }
    .metric-trend {
      font-size: 11px;
      color: var(--text-muted);
      &.text-success { color: var(--success) !important; }
    }

    /* ─── Tabs Card ─── */
    .tabs-card {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }
    .tab-content {
      padding: 28px 32px;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px 32px;
    }
    .info-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 14px;
      color: var(--text-primary);
      font-weight: 500;
    }
    .details-actions {
      margin-top: 32px;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 24px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      border-top: 1px solid var(--border);
      padding-top: 24px;
    }
    .btn-spinner {
      margin-right: 8px;
      display: inline-block;
    }

    /* ─── Preferences ─── */
    .preferences-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .preference-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
    }
    .pref-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pref-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .pref-desc {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* ─── Security & Sessions ─── */
    .security-timeline h4 {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 4px 0;
    }
    .sub-sec-desc {
      font-size: 12px;
      color: var(--text-muted);
      margin: 0 0 16px 0;
    }
    .sessions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .session-device-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 16px;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border);
      border-radius: 10px;
    }
    .device-icon {
      color: var(--text-muted);
      font-size: 22px;
      width: 22px;
      height: 22px;
    }
    .device-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex: 1;
    }
    .device-name-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
    .device-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .session-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(255,255,255,0.06);
      color: var(--text-secondary);
      
      &.active {
        background: rgba(16, 185, 129, 0.1);
        color: #34d399;
        border: 1px solid rgba(16, 185, 129, 0.15);
      }
    }
    .device-meta {
      font-size: 11px;
      color: var(--text-muted);
    }
    .security-actions-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 24px;
      padding: 16px;
      background: rgba(239, 68, 68, 0.02);
      border: 1px solid rgba(239, 68, 68, 0.1);
      border-radius: 10px;
      flex-wrap: wrap;
    }
    .security-info-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .sec-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
    }
    .sec-value {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* ─── Quick Actions Panel ─── */
    .quick-actions-panel {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
    }
    .action-grid {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .action-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 12px 16px;
      height: auto;
      transition: all 0.2s ease;
      color: var(--text-primary);
      justify-content: flex-start;
      width: 100%;
      
      mat-icon {
        color: var(--text-muted);
        transition: color 0.2s ease;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      &:hover {
        background: rgba(99, 102, 241, 0.06);
        border-color: rgba(99, 102, 241, 0.2);
        mat-icon {
          color: #818cf8;
        }
      }
    }

    @media (max-width: 992px) {
      .profile-layout-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 600px) {
      .hero-body {
        flex-direction: column;
        text-align: center;
        margin-top: -50px;
      }
      .hero-details {
        align-items: center;
        margin-top: 0;
      }
      .hero-title-row {
        justify-content: center;
      }
      .details-grid,
      .form-grid {
        grid-template-columns: 1fr;
      }
      .security-actions-card {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  themeService = inject(ThemeService);
  private notificationService = inject(NotificationService);

  user = this.authService.currentUser();
  profileForm!: FormGroup;
  
  isEditing = false;
  isSaving = false;

  // Preferences bindings
  prefEmailAlerts = false;
  prefActivityAlerts = false;

  ngOnInit() {
    this.initData();
  }

  initData(): void {
    this.user = this.authService.currentUser();
    this.profileForm = this.fb.group({
      name: [this.user?.name || '', Validators.required],
      phone: [this.user?.phone || '+91 98450 12345'],
      officeLocation: [this.user?.officeLocation || 'Hyderabad'],
      department: [this.user?.department || '', Validators.required]
    });

    if (this.user) {
      this.prefEmailAlerts = this.user.preferences?.emailAlerts ?? false;
      this.prefActivityAlerts = this.user.preferences?.activityAlerts ?? false;
    }
  }

  userInitials(): string {
    if (!this.user?.name) return 'U';
    const parts = this.user.name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  }

  startEditing(): void {
    this.isEditing = true;
    this.profileForm.patchValue({
      name: this.user?.name || '',
      phone: this.user?.phone || '+91 98450 12345',
      officeLocation: this.user?.officeLocation || 'Hyderabad',
      department: this.user?.department || ''
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.isSaving = true;

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (updatedUser) => {
        this.isSaving = false;
        this.isEditing = false;
        this.user = updatedUser;
        this.notificationService.success('Profile details updated successfully');
      },
      error: () => {
        this.isSaving = false;
        this.notificationService.error('Failed to update profile details');
      }
    });
  }

  onAvatarSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check size limit (max 1.5MB for local base64 storage)
    if (file.size > 1.5 * 1024 * 1024) {
      this.notificationService.error('Image size must be smaller than 1.5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      this.authService.updateProfile({ avatar: base64String }).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.notificationService.success('Avatar updated successfully');
        },
        error: () => {
          this.notificationService.error('Failed to save avatar');
        }
      });
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.authService.updateProfile({ avatar: '' }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.notificationService.success('Avatar removed');
      },
      error: () => {
        this.notificationService.error('Failed to remove avatar');
      }
    });
  }

  savePreferences(): void {
    const prefs = {
      emailAlerts: this.prefEmailAlerts,
      activityAlerts: this.prefActivityAlerts
    };

    this.authService.updateProfile({ preferences: prefs }).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.notificationService.success('Preferences saved successfully');
      },
      error: () => {
        this.notificationService.error('Failed to save preferences');
      }
    });
  }

  triggerPasswordReset(): void {
    this.notificationService.success(`A password reset link has been dispatched to ${this.user?.email || 'your email'}`);
  }

  logout(): void {
    this.authService.logout();
  }
}

import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NotificationService } from '../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { fadeAnimation } from '../../shared/animations';

@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule, MatCheckboxModule
  ],
  animations: [fadeAnimation],
  template: `
    <div class="login-card" @fadeAnimation>
      <div class="login-header">
        <h2>Welcome back</h2>
        <p>Sign in to your NSQTech account</p>
      </div>

      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form" novalidate>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>User ID / Email</mat-label>
          <input
            matInput
            formControlName="email"
            placeholder="Enter User ID or Email"
            autocomplete="username"
            aria-label="User ID or Email Input"
            required
          />
          <mat-icon matSuffix>person</mat-icon>
          @if (loginForm.get('email')?.hasError('required') && loginForm.get('email')?.touched) {
            <mat-error>User ID or Email is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Password</mat-label>
          <input
            matInput
            formControlName="password"
            [type]="showPassword() ? 'text' : 'password'"
            placeholder="Enter your password"
            autocomplete="current-password"
            aria-label="Password Input"
            required
          />
          <button
            mat-icon-button
            matSuffix
            type="button"
            (click)="togglePassword()"
            aria-label="Toggle password visibility"
            [attr.aria-pressed]="showPassword()"
          >
            <mat-icon>{{ showPassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
          </button>
          @if (loginForm.get('password')?.hasError('required') && loginForm.get('password')?.touched) {
            <mat-error>Password is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="field-full">
          <mat-label>Login as</mat-label>
          <mat-select formControlName="role" aria-label="Login Role Selection" required>
            <mat-select-trigger>
              <div class="role-option" style="margin-top: 4px;">
                <mat-icon>{{ loginForm.get('role')?.value === 'admin' ? 'admin_panel_settings' : 'person' }}</mat-icon>
                <span>{{ loginForm.get('role')?.value === 'admin' ? 'Administrator' : 'General User' }}</span>
              </div>
            </mat-select-trigger>
            <mat-option value="user">
              <div class="role-option">
                <mat-icon>person</mat-icon>
                <span>General User</span>
              </div>
            </mat-option>
            <mat-option value="admin">
              <div class="role-option">
                <mat-icon>admin_panel_settings</mat-icon>
                <span>Administrator</span>
              </div>
            </mat-option>
          </mat-select>
          <mat-icon matSuffix>badge</mat-icon>
        </mat-form-field>

        <div class="login-options">
          <mat-checkbox formControlName="rememberMe" color="primary">Remember me</mat-checkbox>
          <a href="#" class="forgot-password-link" (click)="$event.preventDefault()">Forgot password?</a>
        </div>

        @if (errorMessage()) {
          <div class="error-alert" role="alert">
            <mat-icon>error_outline</mat-icon>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <button
          mat-flat-button
          color="primary"
          class="submit-btn"
          type="submit"
          [disabled]="loginForm.invalid || isLoading()"
          aria-label="Submit Sign In credentials"
        >
          @if (isLoading()) {
            <mat-spinner diameter="20" color="accent" class="btn-spinner" aria-label="Authenticating credentials" />
            <span>Signing in...</span>
          } @else {
            <ng-container>
              <mat-icon style="margin-right: 8px;">login</mat-icon>
              <span>Sign In</span>
            </ng-container>
          }
        </button>
      </form>

      <div class="demo-credentials">
        <p class="demo-title">Demo Credentials</p>
        <div class="creds-grid">
          <div class="cred-item" (click)="fillAdmin()">
            <mat-icon>admin_panel_settings</mat-icon>
            <div>
              <p>Admin</p>
              <span>admin / admin123</span>
            </div>
          </div>
          <div class="cred-item" (click)="fillUser()">
            <mat-icon>person</mat-icon>
            <div>
              <p>General User</p>
              <span>yash / yash123</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Premium loading overlay -->
      @if (isLoading()) {
        <div class="loading-overlay" @fadeAnimation>
          <mat-spinner diameter="40"></mat-spinner>
          <p>Authenticating workspace...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .login-card {
      width: 100%;
      max-width: 400px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      padding: 40px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255,255,255,0.02);
      position: relative;
      overflow: hidden;
      
      &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      }
      
      html.light-theme & {
        background: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(0, 0, 0, 0.06);
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255,255,255,0.8);
        
        &::before {
          background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.08), transparent);
        }
      }
    }
    .login-header {
      margin-bottom: 40px;
      text-align: center;
      h2 {
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: -0.04em;
        color: var(--text-primary);
      }
      p { margin: 0; color: var(--text-muted); font-size: 15px; }
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .field-full { width: 100%; }

    .role-option {
      display: flex;
      align-items: center;
      gap: 8px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }

    .error-alert {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 8px;
      padding: 10px 14px;
      color: #fca5a5;
      font-size: 13px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #f87171; }
    }

    .submit-btn {
      height: 48px;
      font-size: 15px;
      font-weight: 600;
      border-radius: var(--radius-sm) !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 16px;
      background: linear-gradient(135deg, var(--accent), var(--accent-hover)) !important;
      color: white !important;
      box-shadow: 0 4px 14px rgba(124, 137, 255, 0.2) !important;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:hover:not([disabled]) {
        box-shadow: 0 8px 24px rgba(124, 137, 255, 0.4) !important;
        transform: translateY(-2px);
      }
      &:active:not([disabled]) {
        transform: translateY(0) scale(0.98);
      }
    }
    .btn-spinner { display: inline-block; }

    .demo-credentials {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
    }
    .demo-title {
      margin: 0 0 12px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .creds-grid {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cred-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: var(--bg-primary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all 0.2s;
    }
    .cred-item mat-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; margin-top: 2px; }
    .cred-item p { margin: 0; font-size: 13px; font-weight: 500; color: var(--text-primary); }
    .cred-item span { font-size: 11px; color: var(--text-muted); font-family: monospace; }
    
    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 24px;
      margin-top: -12px;
      padding: 0 4px;
    }
    
    .forgot-password-link {
      font-size: 13px;
      color: #818cf8;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
      &:hover { color: #a5b4fc; }
    }

    .loading-overlay {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 100;
      border-radius: 20px;
      gap: 16px;
      
      p {
        color: white;
        font-weight: 500;
        font-size: 14px;
        margin: 0;
      }
      
      html.light-theme & {
        background: rgba(255, 255, 255, 0.75);
        p {
          color: var(--text-primary);
        }
      }
    }
  `],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', Validators.required],
    role: ['admin', Validators.required],
    rememberMe: [false]
  });

  togglePassword(): void {
    this.showPassword.update(s => !s);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password, role } = this.loginForm.value;

    this.authService.login({ email: email!, password: password!, role: role as 'admin' | 'user' })
      .subscribe({
        next: (data) => {
          this.isLoading.set(false);
          this.notificationService.success(`Welcome back, ${data.user.name}!`);
          this.router.navigate(['/app/dashboard']);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set(err.error?.message ?? 'Login failed. Please try again.');
        },
      });
  }

  fillAdmin(): void {
    this.loginForm.patchValue({ email: 'admin', password: 'admin123', role: 'admin' });
  }

  fillUser(): void {
    this.loginForm.patchValue({ email: 'yash', password: 'yash123', role: 'user' });
  }
}

import { Component, Inject, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { User } from '../../shared/models/user.model';

export interface UserFormDialogData {
  user?: User;
  mode: 'create' | 'edit';
}

const DEPARTMENTS = [
  'Engineering', 'Frontend Development', 'Backend Development', 'DevOps',
  'Design', 'QA & Testing', 'Product Management', 'Data Science',
  'Cloud Infrastructure', 'Security', 'Human Resources', 'Finance',
  'Legal', 'Compliance', 'Operations', 'IT Support', 'Customer Success',
  'Product', 'Marketing', 'General',
];

@Component({
  selector: 'app-user-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
  ],
  template: `
    <div class="user-form-dialog">
      <div class="dialog-header">
        <div class="header-icon" [class.edit-mode]="data.mode === 'edit'">
          <mat-icon>{{ data.mode === 'edit' ? 'edit' : 'person_add' }}</mat-icon>
        </div>
        <div>
          <h2 mat-dialog-title>{{ data.mode === 'edit' ? 'Edit User' : 'Add New User' }}</h2>
          <p>{{ data.mode === 'edit' ? 'Update user details and permissions' : 'Create a new user account' }}</p>
        </div>
      </div>

      <mat-dialog-content>
        <form [formGroup]="form" class="form-grid" novalidate>
          <mat-form-field appearance="outline">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="John Doe" />
            <mat-icon matSuffix>person</mat-icon>
            @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
              <mat-error>Name is required</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" placeholder="user@nsqtech.com" />
            <mat-icon matSuffix>email</mat-icon>
            @if (form.get('email')?.hasError('required') && form.get('email')?.touched) {
              <mat-error>Email is required</mat-error>
            }
            @if (form.get('email')?.hasError('email') && form.get('email')?.touched) {
              <mat-error>Enter a valid email</mat-error>
            }
          </mat-form-field>

          @if (data.mode === 'create') {
            <mat-form-field appearance="outline">
              <mat-label>Password</mat-label>
              <input matInput formControlName="password" type="password" placeholder="Min. 6 characters" />
              <mat-icon matSuffix>lock</mat-icon>
              @if (form.get('password')?.hasError('required') && form.get('password')?.touched) {
                <mat-error>Password is required</mat-error>
              }
              @if (form.get('password')?.hasError('minlength') && form.get('password')?.touched) {
                <mat-error>Minimum 6 characters</mat-error>
              }
            </mat-form-field>
          }

          <mat-form-field appearance="outline">
            <mat-label>Role</mat-label>
            <mat-select formControlName="role">
              <mat-option value="user">General User</mat-option>
              <mat-option value="admin">Administrator</mat-option>
            </mat-select>
            <mat-icon matSuffix>badge</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="department">
              @for (dept of departments; track dept) {
                <mat-option [value]="dept">{{ dept }}</mat-option>
              }
            </mat-select>
            <mat-icon matSuffix>business</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="active">Active</mat-option>
              <mat-option value="inactive">Inactive</mat-option>
              <mat-option value="pending">Pending Review</mat-option>
              <mat-option value="on-leave">On Leave</mat-option>
              <mat-option value="suspended">Suspended</mat-option>
              <mat-option value="offline">Offline</mat-option>
            </mat-select>
            <mat-icon matSuffix>toggle_on</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()" [disabled]="isLoading()">
          Cancel
        </button>
        <button
          mat-flat-button
          color="primary"
          (click)="onSubmit()"
          [disabled]="form.invalid || isLoading()"
        >
          @if (isLoading()) {
            <mat-spinner diameter="18" />
            <span>{{ data.mode === 'edit' ? 'Saving...' : 'Creating...' }}</span>
          } @else {
            <ng-container>
              <mat-icon>{{ data.mode === 'edit' ? 'save' : 'add' }}</mat-icon>
              <span>{{ data.mode === 'edit' ? 'Save Changes' : 'Create User' }}</span>
            </ng-container>
          }
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .user-form-dialog { min-width: 480px; }

    .dialog-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px 24px 8px;
    }
    .header-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(124, 137, 255, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      mat-icon { color: var(--accent); }
    }
    .header-icon.edit-mode { background: rgba(245, 158, 11, 0.08); mat-icon { color: var(--warning); } }
    h2[mat-dialog-title] { margin: 0 0 2px; font-size: 18px; font-weight: 700; }
    .dialog-header p { margin: 0; font-size: 13px; color: var(--text-muted); }

    mat-dialog-content { padding: 16px 24px !important; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4px 12px;
    }

    mat-dialog-actions {
      padding: 12px 24px 20px !important;
      gap: 8px;
      button { display: flex; align-items: center; gap: 6px; }
      mat-spinner { display: inline-block; }
    }
  `],
})
export class UserFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  isLoading = signal(false);
  departments = DEPARTMENTS;

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]],
    role: ['user' as 'admin' | 'user', Validators.required],
    department: ['General', Validators.required],
    status: ['active' as 'active' | 'inactive' | 'pending' | 'on-leave' | 'suspended' | 'offline', Validators.required],
  });

  constructor(
    private dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserFormDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.user) {
      this.form.patchValue(this.data.user);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
    } else {
      this.form.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ formValue: this.form.value, mode: this.data.mode });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}

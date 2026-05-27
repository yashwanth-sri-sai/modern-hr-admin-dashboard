import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, CommonModule],
  template: `
    <div class="confirm-dialog dialog-animate">
      <div class="dialog-header" [class.danger]="data.danger">
        <mat-icon>{{ data.danger ? 'warning' : 'help_outline' }}</mat-icon>
        <h2>{{ data.title }}</h2>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button (click)="onCancel()">
          {{ data.cancelLabel || 'Cancel' }}
        </button>
        <button
          mat-flat-button
          [color]="data.danger ? 'warn' : 'primary'"
          (click)="onConfirm()"
        >
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .confirm-dialog { padding: 8px; min-width: 360px; }
    .dialog-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 24px 8px;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--accent); }
      h2 { margin: 0; font-size: 18px; font-weight: 600; }
    }
    .dialog-header.danger mat-icon { color: var(--danger); }
    mat-dialog-content p { color: var(--text-secondary); margin: 0; line-height: 1.6; }
    mat-dialog-actions { padding: 16px 24px; gap: 8px; }
  `],
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void { this.dialogRef.close(true); }
  onCancel(): void { this.dialogRef.close(false); }
}

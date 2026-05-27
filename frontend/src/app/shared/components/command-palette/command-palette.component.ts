import { Component, HostListener, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ExportService } from '../../../core/services/export.service';

interface CommandItem {
  id: string;
  icon: string;
  label: string;
  subtitle?: string;
  action: () => void;
  category: 'Navigation' | 'Actions';
}

@Component({
  selector: 'app-command-palette',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  template: `
    <div class="command-palette-container">
      <div class="search-header">
        <mat-icon class="search-icon">search</mat-icon>
        <input 
          type="text" 
          [formControl]="searchControl"
          placeholder="Search commands, navigate, or act..." 
          autocomplete="off"
          spellcheck="false"
          #searchInput
          autofocus
        />
        <div class="shortcut-hint">ESC</div>
      </div>
      
      <div class="command-list-area">
        @if (filteredCommands().length === 0) {
          <div class="no-results">
            <mat-icon>search_off</mat-icon>
            <p>No commands found</p>
          </div>
        } @else {
          <div class="command-group">
            @for (cmd of filteredCommands(); track cmd.id; let i = $index) {
              <div 
                class="command-item" 
                [class.selected]="selectedIndex() === i"
                (mouseenter)="selectedIndex.set(i)"
                (click)="executeCommand(cmd)"
              >
                <mat-icon class="cmd-icon">{{ cmd.icon }}</mat-icon>
                <div class="cmd-details">
                  <span class="cmd-label">{{ cmd.label }}</span>
                  @if (cmd.subtitle) {
                    <span class="cmd-subtitle">{{ cmd.subtitle }}</span>
                  }
                </div>
                <span class="enter-hint" *ngIf="selectedIndex() === i">Enter ↵</span>
              </div>
            }
          </div>
        }
      </div>
      
      <div class="command-footer">
        <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
        <span><kbd>↵</kbd> to select</span>
      </div>
    </div>
  `,
  styles: [`
    .command-palette-container {
      background: var(--bg-secondary);
      backdrop-filter: blur(16px);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
      color: var(--text-primary);
      width: 600px;
      max-width: 90vw;
      box-shadow: var(--shadow-lg);
      display: flex;
      flex-direction: column;
    }
    .search-header {
      display: flex;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      gap: 12px;
    }
    .search-icon {
      color: var(--text-muted);
    }
    input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--text-primary);
      font-size: 16px;
      &::placeholder {
        color: rgba(148, 163, 184, 0.5);
      }
    }
    .shortcut-hint {
      font-size: 10px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--border-strong);
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .command-list-area {
      max-height: 350px;
      overflow-y: auto;
      padding: 12px;
    }
    .command-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      cursor: pointer;
      gap: 16px;
      transition: background 0.1s ease;
      
      &.selected {
        background: rgba(124, 137, 255, 0.12);
        .cmd-icon { color: var(--accent); }
        .enter-hint { opacity: 1; }
      }
    }
    .cmd-icon {
      color: var(--text-muted);
    }
    .cmd-details {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .cmd-label {
      font-size: 14px;
      font-weight: 500;
    }
    .cmd-subtitle {
      font-size: 12px;
      color: var(--text-muted);
    }
    .enter-hint {
      font-size: 11px;
      color: var(--accent);
      opacity: 0;
      font-weight: 500;
    }
    .command-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 20px;
      border-top: 1px solid var(--border);
      font-size: 12px;
      color: var(--text-muted);
      background: var(--bg-primary);
    }
    kbd {
      background: var(--border-strong);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: inherit;
    }
    .no-results {
      text-align: center;
      padding: 32px;
      color: var(--text-muted);
      mat-icon { margin-bottom: 8px; opacity: 0.5; }
    }
  `]
})
export class CommandPaletteComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<CommandPaletteComponent>);
  private router = inject(Router);
  private exportService = inject(ExportService);
  
  searchControl = new FormControl('');
  selectedIndex = signal(0);
  
  private allCommands: CommandItem[] = [
    { id: 'nav-dash', icon: 'dashboard', label: 'Go to Dashboard', category: 'Navigation', action: () => this.navigate('/app/dashboard') },
    { id: 'nav-users', icon: 'people', label: 'Go to Users Panel', subtitle: 'Manage system users', category: 'Navigation', action: () => this.navigate('/app/admin') },
    { id: 'nav-profile', icon: 'person', label: 'Go to My Profile', subtitle: 'Manage account preferences', category: 'Navigation', action: () => this.navigate('/app/profile') },
    { id: 'action-export', icon: 'download', label: 'Export All Records (CSV)', category: 'Actions', action: () => {
      this.exportCSVStub();
    }},
  ];
  
  filteredCommands = signal<CommandItem[]>(this.allCommands);

  ngOnInit() {
    this.searchControl.valueChanges.subscribe(val => {
      if (!val) {
        this.filteredCommands.set(this.allCommands);
      } else {
        const query = val.toLowerCase();
        this.filteredCommands.set(this.allCommands.filter(c => c.label.toLowerCase().includes(query)));
      }
      this.selectedIndex.set(0);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const list = this.filteredCommands();
    if (list.length === 0) return;
    
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => (i + 1) % list.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => (i - 1 + list.length) % list.length);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.executeCommand(list[this.selectedIndex()]);
    }
  }

  executeCommand(cmd: CommandItem) {
    cmd.action();
  }

  exportCSVStub(): void {
    this.dialogRef.close();
  }

  private navigate(path: string) {
    this.router.navigate([path]);
    this.dialogRef.close();
  }
}

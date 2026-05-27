import { Component, OnInit, OnDestroy, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { filter, takeUntil, Subject } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, MatIconModule],
  template: `
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-list">
        <!-- Always show Home/Dashboard as root -->
        <li class="breadcrumb-item">
          <a routerLink="/app/dashboard" class="breadcrumb-link" [class.active]="breadcrumbs().length === 0" title="Return to Dashboard (Alt+D)">
            <mat-icon class="crumb-icon">dashboard</mat-icon>
            <span class="crumb-text">Dashboard</span>
          </a>
        </li>
        
        @for (crumb of breadcrumbs(); track crumb.url; let last = $last) {
          <li class="breadcrumb-separator">/</li>
          <li class="breadcrumb-item">
            <a 
              [routerLink]="crumb.url" 
              class="breadcrumb-link" 
              [class.active]="last"
              [attr.aria-current]="last ? 'page' : null"
            >
              {{ crumb.label }}
            </a>
          </li>
        }
      </ol>
    </nav>
  `,
  styles: [`
    .breadcrumb-nav {
      margin: 0;
      padding: 0;
      background: transparent;
      border: none;
      border-radius: 0;
      display: flex;
      align-items: center;
      height: 36px;
    }
    .breadcrumb-list {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 4px;
    }
    .breadcrumb-item {
      display: flex;
      align-items: center;
    }
    .breadcrumb-separator {
      display: flex;
      align-items: center;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 300;
      opacity: 0.3;
      user-select: none;
      padding: 0 4px;
    }
    .breadcrumb-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s ease;
      padding: 6px 10px;
      border-radius: var(--radius-sm);
      
      &:hover {
        color: var(--text-primary);
        background: rgba(255, 255, 255, 0.03);
      }
      
      &.active {
        color: var(--text-primary);
        font-weight: 600;
        pointer-events: none;
        background: transparent;
      }
    }
    .crumb-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--accent);
      opacity: 0.8;
      display: inline-block;
    }
    .breadcrumb-link.active .crumb-icon {
      opacity: 1;
    }
    .crumb-text {
      line-height: 1;
    }
  `]
})
export class BreadcrumbComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  
  breadcrumbs = signal<Breadcrumb[]>([]);

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.breadcrumbs.set(this.buildBreadcrumb(this.activatedRoute.root));
      });
      
    // Initial load
    this.breadcrumbs.set(this.buildBreadcrumb(this.activatedRoute.root));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildBreadcrumb(route: ActivatedRoute, url: string = '', breadcrumbs: Breadcrumb[] = []): Breadcrumb[] {
    let nextUrl = url;
    let newBreadcrumbs = [...breadcrumbs];

    if (route.routeConfig && route.routeConfig.path) {
      nextUrl += `/${route.routeConfig.path}`;
      
      // Don't duplicate dashboard or app layout route since we hardcode dashboard home
      if (route.routeConfig.path !== 'dashboard' && route.routeConfig.path !== 'app') {
        // Look for custom data.breadcrumb, otherwise fallback to title casing the path
        const label = route.routeConfig.data?.['breadcrumb'] || this.formatPath(route.routeConfig.path);
        
        newBreadcrumbs.push({
          label: label,
          url: nextUrl
        });
      }
    }

    if (route.firstChild) {
      return this.buildBreadcrumb(route.firstChild, nextUrl, newBreadcrumbs);
    }
    return newBreadcrumbs;
  }

  private formatPath(path: string): string {
    // Basic fallback: remove hyphens, title case
    return path.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }
}

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Root redirect
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // ── Auth (public) ─────────────────────────────────────────────────────────
  {
    path: 'auth',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then((m) => m.LoginComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },

  // ── Protected shell ────────────────────────────────────────────────────────
  {
    path: 'app',
    loadComponent: () =>
      import('./layouts/shell-layout/shell-layout.component').then(
        (m) => m.ShellLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        data: { animation: 'dashboard' },
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'profile',
        data: { animation: 'profile', breadcrumb: 'My Profile' },
        loadComponent: () =>
          import('./profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
      {
        path: 'admin',
        data: { animation: 'admin' },
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./admin/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
      },
      {
        path: 'audit-logs',
        data: { animation: 'admin', breadcrumb: 'Audit Logs' },
        canActivate: [adminGuard],
        loadComponent: () =>
          import('./admin/audit-logs/audit-logs.component').then(
            (m) => m.AuditLogsComponent
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // Catch-all
  { path: '**', redirectTo: 'auth/login' },
];

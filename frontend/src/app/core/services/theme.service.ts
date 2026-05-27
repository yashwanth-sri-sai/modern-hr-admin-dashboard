import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'nsq_theme';

  isDarkMode = signal<boolean>(this.loadInitialTheme());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggleTheme(): void {
    const root = document.documentElement;
    root.classList.add('theme-transitioning');
    this.isDarkMode.update((dark) => !dark);
    this.applyTheme(this.isDarkMode());
    window.setTimeout(() => root.classList.remove('theme-transitioning'), 400);
  }

  private applyTheme(dark: boolean): void {
    localStorage.setItem(this.THEME_KEY, dark ? 'dark' : 'light');
    const root = document.documentElement;
    if (dark) {
      root.classList.remove('light-theme');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light-theme');
      root.style.colorScheme = 'light';
    }
  }

  private loadInitialTheme(): boolean {
    const saved = localStorage.getItem(this.THEME_KEY);
    if (saved) return saved === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? false : true;
  }
}

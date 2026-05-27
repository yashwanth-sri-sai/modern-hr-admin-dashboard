import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [':host { display: block; height: 100%; }'],
})
export class App {
  constructor(theme: ThemeService) {
    void theme;
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roleLabel', standalone: true })
export class RoleLabelPipe implements PipeTransform {
  transform(role: string): string {
    const map: Record<string, string> = {
      admin: 'Administrator',
      user: 'General User',
    };
    return map[role] ?? role;
  }
}

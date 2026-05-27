import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ActivityLog } from '../../shared/models/activity.model';
import { ApiResponse } from '../../shared/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly API = '/api/v1/activity';
  private http = inject(HttpClient);

  getActivities(): Observable<ActivityLog[]> {
    return this.http.get<ApiResponse<ActivityLog[]>>(this.API).pipe(
      map((res) => res.data)
    );
  }
}

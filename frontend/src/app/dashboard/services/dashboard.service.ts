import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse, DashboardStats, Record } from '../../shared/models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly USERS_API = `${environment.apiUrl}/users`;
  private readonly RECORDS_API = `${environment.apiUrl}/records`;
  private http = inject(HttpClient);

  getStats(): Observable<DashboardStats> {
    const params = new HttpParams().set('delay', '1500'); // Showcase async loading as requested
    return this.http
      .get<ApiResponse<DashboardStats>>(`${this.USERS_API}/stats`, { params })
      .pipe(map((res) => res.data));
  }

  getRecords(filters?: { category?: string; status?: string }): Observable<Record[]> {
    let params = new HttpParams().set('delay', '2000'); // Showcase async loading as requested
    if (filters?.category) params = params.set('category', filters.category);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http
      .get<ApiResponse<Record[]>>(this.RECORDS_API, { params })
      .pipe(map((res) => res.data));
  }

  updateRecord(id: string, data: Partial<Record>): Observable<Record> {
    return this.http
      .put<ApiResponse<Record>>(`${this.RECORDS_API}/${id}`, data)
      .pipe(map((res) => res.data));
  }
}

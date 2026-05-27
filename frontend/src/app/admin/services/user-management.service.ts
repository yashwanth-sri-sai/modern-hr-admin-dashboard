import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../../shared/models/api-response.model';
import { User, CreateUserDto, UpdateUserDto } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly API = '/api/v1/users';
  private http = inject(HttpClient);

  getUsers(filters?: { search?: string; role?: string; status?: string }): Observable<User[]> {
    let params = new HttpParams();
    if (filters?.search) params = params.set('search', filters.search);
    if (filters?.role) params = params.set('role', filters.role);
    if (filters?.status) params = params.set('status', filters.status);

    return this.http
      .get<ApiResponse<User[]>>(this.API, { params })
      .pipe(map((res) => res.data));
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(this.API, data)
      .pipe(map((res) => res.data));
  }

  updateUser(id: string, data: UpdateUserDto): Observable<User> {
    return this.http
      .put<ApiResponse<User>>(`${this.API}/${id}`, data)
      .pipe(map((res) => res.data));
  }

  deleteUser(id: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.API}/${id}`);
  }
}

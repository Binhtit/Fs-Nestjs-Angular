/**
 * KHÁI NIỆM: Abstract Base API Service
 *
 * SCALABLE DESIGN:
 * - Tất cả feature services KẾ THỪA class này
 * - Thêm feature mới = extends BaseApiService<NewModel>
 * - CRUD operations đã có sẵn, chỉ cần set endpoint
 *
 * VÍ DỤ:
 * class TaskService extends BaseApiService<Task> {
 *   endpoint = '/tasks';
 *   // Done! Đã có getAll, getById, create, update, delete
 * }
 *
 * RxJS PATTERNS:
 * - Mỗi method trả về Observable<T> (không subscribe ở service)
 * - Component subscribe (hoặc toSignal) → auto-cleanup
 * - pipe(map(res => res.data)) → extract data từ wrapper
 */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { ApiResponse, PaginationMeta } from '../models/api-response.model';

/** Kết quả trả về từ getAll — data + pagination tách riêng */
export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export abstract class BaseApiService<T> {
  /** Endpoint path (ví dụ: '/tasks', '/users') — subclass override */
  protected abstract endpoint: string;

  /** Inject HttpClient — Angular 14+ inject() function */
  protected http = inject(HttpClient);

  /** Full URL = baseUrl + endpoint */
  protected get url(): string {
    return `${environment.apiUrl}${this.endpoint}`;
  }

  /**
   * GET all items (có pagination, filter)
   *
   * BACKEND trả về:
   * { success, data: Task[], pagination: { page, limit, total, totalPages } }
   *
   * FE extract → { items: Task[], pagination: {...} }
   */
  getAll(params?: Record<string, string | number>): Observable<PaginatedResult<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, String(value));
        }
      });
    }

    return this.http
      .get<ApiResponse<T[]>>(this.url, { params: httpParams })
      .pipe(
        retry(1),
        map((res) => ({
          items: res.data ?? [],
          pagination: res.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 0 },
        })),
      );
  }

  /** GET by ID */
  getById(id: number): Observable<T> {
    return this.http.get<ApiResponse<T>>(`${this.url}/${id}`).pipe(
      retry(1),
      map((res) => res.data),
    );
  }

  /** POST create */
  create(data: Partial<T>): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(this.url, data)
      .pipe(map((res) => res.data));
  }

  /** PATCH update */
  update(id: number, data: Partial<T>): Observable<T> {
    return this.http
      .patch<ApiResponse<T>>(`${this.url}/${id}`, data)
      .pipe(map((res) => res.data));
  }

  /** DELETE */
  delete(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.url}/${id}`)
      .pipe(map(() => undefined));
  }
}

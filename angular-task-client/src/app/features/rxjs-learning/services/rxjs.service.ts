/**
 * RxJS Learning Service
 *
 * RxJS PATTERN: shareReplay(1)
 * - Cache API response — gọi API 1 lần, subscribers sau dùng cache
 * - Lessons không thay đổi → cache vĩnh viễn
 * - Tiết kiệm bandwidth + tốc độ
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import { ApiResponse } from '@core/models/api-response.model';

export interface Lesson {
  concept: string;
  explanation: string;
  codeExample: string;
  result: unknown;
  bestPractices: string[];
}

/** Danh sách endpoints bài học */
const LESSON_ENDPOINTS = [
  { path: 'observable-vs-promise', label: 'Observable vs Promise' },
  { path: 'pipe-operators', label: 'Pipe Operators' },
  { path: 'higher-order-mapping', label: 'Higher-Order Mapping' },
  { path: 'subjects', label: 'Subjects' },
  { path: 'combining-streams', label: 'Combining Streams' },
  { path: 'error-handling', label: 'Error Handling' },
  { path: 'rate-limiting', label: 'Rate Limiting' },
  { path: 'unsubscribe-patterns', label: 'Unsubscribe Patterns' },
  { path: 'real-world-websocket', label: 'Real-world WebSocket' },
];

@Injectable({ providedIn: 'root' })
export class RxjsService {
  private baseUrl = `${environment.apiUrl}/rxjs`;

  constructor(private http: HttpClient) {}

  /** Lấy 1 bài học (cached) */
  getLesson(path: string): Observable<Lesson> {
    return this.http
      .get<ApiResponse<Lesson>>(`${this.baseUrl}/${path}`)
      .pipe(
        map((res) => res.data),
        /** shareReplay(1): Cache response → subscribers sau không gọi API lại */
        shareReplay(1),
      );
  }

  /** Lấy danh sách endpoints */
  getLessonList(): { path: string; label: string }[] {
    return LESSON_ENDPOINTS;
  }
}

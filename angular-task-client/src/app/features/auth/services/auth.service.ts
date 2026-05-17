/**
 * KHÁI NIỆM: Auth Service — Signal-based State + RxJS Async
 *
 * PATTERN: "Signals for State, RxJS for Streams"
 * - currentUser: signal() → đồng bộ, không cần subscribe
 * - login(): Observable → bất đồng bộ, cần RxJS operators
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. User submit form → gọi login() → RxJS HTTP call
 * 2. Response → tap() side-effect: lưu token + set signal
 * 3. Component đọc isAuthenticated() → Signal tự update UI
 */
import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@env';
import {
  LoginRequest,
  RegisterRequest,
  AuthTokens,
  UserInfo,
} from '@core/models/auth.model';
import { ApiResponse } from '@core/models/api-response.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  currentUser = signal<UserInfo | null>(this.loadUserFromStorage());
  isAuthenticated = computed(() => this.currentUser() !== null);

  /**
   * LOGIN:
   * RxJS Pipeline: POST → map(extract data) → tap(save tokens + update state)
   *
   * tap() = side-effect operator:
   * - Không thay đổi stream data
   * - Dùng cho: lưu token, update state, logging
   */
  login(data: LoginRequest): Observable<AuthTokens> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.baseUrl}/login`, data)
      .pipe(
        map((res) => res.data),
        tap((tokens) => this.saveSession(tokens)),
      );
  }

  register(data: RegisterRequest): Observable<AuthTokens> {
    return this.http
      .post<ApiResponse<AuthTokens>>(`${this.baseUrl}/register`, data)
      .pipe(
        map((res) => res.data),
        tap((tokens) => this.saveSession(tokens)),
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_info');
    this.currentUser.set(null);
  }

  /** Lưu tokens + decode user info từ JWT */
  private saveSession(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.accessToken);
    localStorage.setItem('refresh_token', tokens.refreshToken);

    /** Decode JWT payload (phần giữa, base64) */
    const payload = this.decodeJwt(tokens.accessToken);
    if (payload) {
      const user: UserInfo = {
        id: payload['sub'],
        email: payload['email'],
        name: payload['name'] ?? '',
        role: payload['role'] ?? 'user',
      };
      localStorage.setItem('user_info', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  /** Load user từ localStorage khi app khởi động */
  private loadUserFromStorage(): UserInfo | null {
    const stored = localStorage.getItem('user_info');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /** Decode JWT payload (không verify — chỉ đọc data) */
  private decodeJwt(token: string): Record<string, any> | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      return JSON.parse(atob(parts[1]));
    } catch {
      return null;
    }
  }
}

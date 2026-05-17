/**
 * Error Interceptor — Xử lý lỗi HTTP tập trung
 *
 * THAY VÌ mỗi component tự catch lỗi:
 * → Interceptor catch 1 lần, xử lý chung
 * → Component chỉ cần handle logic riêng (nếu có)
 *
 * RxJS PATTERN: catchError + throwError
 * - catchError: bắt lỗi trong stream
 * - throwError: ném lỗi lại cho caller biết (không nuốt lỗi)
 */
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error) => {
      switch (error.status) {
        case 401:
          /**
           * 401 Unauthorized: Token hết hạn hoặc invalid
           * → Xóa token, redirect về login
           */
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          router.navigate(['/auth/login']);
          break;

        case 403:
          /** 403 Forbidden: Không có quyền */
          console.error('🚫 Không có quyền truy cập');
          break;

        case 0:
          /** Network error: Server down hoặc CORS blocked */
          console.error('🌐 Không thể kết nối server');
          break;
      }

      /**
       * QUAN TRỌNG: Luôn throwError lại
       * → Caller (component/service) vẫn nhận được lỗi để xử lý local
       * → KHÔNG nuốt lỗi (anti-pattern)
       */
      return throwError(() => error);
    }),
  );
};

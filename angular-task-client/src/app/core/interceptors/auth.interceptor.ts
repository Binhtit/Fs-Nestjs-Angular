/**
 * KHÁI NIỆM: Functional HTTP Interceptor — Auth
 *
 * INTERCEPTOR là gì:
 * - Middleware cho HTTP requests
 * - Chạy TRƯỚC mọi request gửi đi và SAU mọi response nhận về
 * - Dùng để: attach token, logging, transform request/response
 *
 * Angular 19+ dùng FUNCTIONAL interceptor (không cần class):
 * - Đơn giản hơn, tree-shakable
 * - Inject services bằng inject() function
 *
 * FLOW:
 * Component gọi http.get() → AuthInterceptor attach token → Server
 * Server response 401 → ErrorInterceptor catch → redirect login
 */
import { HttpInterceptorFn } from '@angular/common/http';

/**
 * authInterceptor: Tự động gắn JWT token vào mọi request
 *
 * RxJS: Interceptor return Observable<HttpEvent>
 * next(req) = chuyển request cho interceptor tiếp theo hoặc server
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  /** Đọc token từ localStorage */
  const token = localStorage.getItem('access_token');

  /**
   * Nếu CÓ token → clone request và thêm header Authorization
   *
   * TẠI SAO clone:
   * - HttpRequest là IMMUTABLE (không thể modify trực tiếp)
   * - Phải tạo bản copy mới với header mới
   * - Đây là design pattern của Angular HttpClient
   */
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }

  /** Không có token → gửi request gốc (không auth) */
  return next(req);
};

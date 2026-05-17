/**
 * KHÁI NIỆM: Logging Interceptor với RxJS tap()
 *
 * RxJS OPERATOR: tap()
 * - TÁC DỤNG: Thực thi side-effect MÀ KHÔNG thay đổi data trong stream
 * - GIỐNG: "Nghe lén" stream, nhìn data đi qua nhưng không sửa
 * - DÙNG KHI: Logging, debugging, analytics, audit trail
 *
 * SO SÁNH tap() vs map():
 * ┌─────────┬──────────────────────────┬──────────────────────────┐
 * │         │ tap()                    │ map()                    │
 * ├─────────┼──────────────────────────┼──────────────────────────┤
 * │ Mục đích│ Side-effect              │ Transform data           │
 * │ Return  │ KHÔNG ảnh hưởng stream   │ Return giá trị mới       │
 * │ Data    │ Data KHÔNG đổi           │ Data THAY ĐỔI            │
 * │ Ví dụ   │ console.log, tracking    │ Wrap response, format    │
 * └─────────┴──────────────────────────┴──────────────────────────┘
 *
 * THỰC TẾ: Logging interceptor là 1 trong những use case phổ biến nhất
 * của NestJS interceptor. Ghi lại method, URL, thời gian xử lý cho mỗi request.
 *
 * LỖI PHỔ BIẾN:
 * - Dùng map() cho logging → vô tình thay đổi response data
 * - Log quá nhiều data (body, headers) → performance issue + bảo mật
 * - Không log error case → chỉ biết success, không biết failure
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  /**
   * Logger instance của NestJS
   * Dùng NestJS Logger thay vì console.log vì:
   * 1. Có timestamp, context (class name) tự động
   * 2. Có log levels: log, error, warn, debug, verbose
   * 3. Có thể redirect output (file, external service)
   * 4. Production có thể disable verbose/debug level
   */
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    /**
     * === PHASE 1: TRƯỚC KHI CONTROLLER XỬ LÝ ===
     * Code ở đây chạy TRƯỚC next.handle()
     */
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const now = Date.now();

    /**
     * Log incoming request
     * Ghi nhận: HTTP method + URL + thời điểm bắt đầu
     */
    this.logger.log(`→ ${method} ${url} - Bắt đầu xử lý`);

    /**
     * === PHASE 2: SAU KHI CONTROLLER XỬ LÝ ===
     *
     * next.handle() → Observable chứa response
     * .pipe(tap(...)) → "nghe lén" response để log, KHÔNG sửa data
     *
     * tap() nhận object với 2 callbacks:
     * - next: Gọi khi Observable emit giá trị (success)
     * - error: Gọi khi Observable throw error (failure)
     *
     * TẠI SAO dùng tap({ next, error }) thay vì tap(successFn):
     * - Bắt được cả success và error case
     * - Logging phải ghi TOÀN BỘ lifecycle, không chỉ success
     */
    return next.handle().pipe(
      tap({
        /**
         * Success callback
         * Ghi nhận: Thời gian xử lý request
         *
         * Date.now() - now = số milliseconds từ lúc request đến → response
         * Giúp detect slow endpoints cần optimize
         */
        next: () => {
          const duration = Date.now() - now;
          this.logger.log(`← ${method} ${url} - ${duration}ms`);
        },

        /**
         * Error callback
         * Ghi nhận: Request bị lỗi + thời gian + error message
         *
         * LƯU Ý: tap() error callback KHÔNG swallow error
         * Error vẫn propagate xuống Exception Filter
         */
        error: (error: Error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `✗ ${method} ${url} - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }
}

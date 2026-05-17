/**
 * KHÁI NIỆM: Timeout Interceptor với RxJS timeout() + catchError()
 *
 * TẠI SAO cần timeout:
 * 1. Tránh request treo vĩnh viễn (DB deadlock, external API không response)
 * 2. Giải phóng resource: connection pool, memory, thread
 * 3. UX: User không phải chờ vô hạn, nhận lỗi rõ ràng
 * 4. Cascading failure: 1 service chậm → kéo chậm toàn bộ hệ thống
 *
 * RxJS OPERATOR: timeout()
 * - TÁC DỤNG: Throw TimeoutError nếu Observable không emit trong thời gian quy định
 * - GIỐNG: setTimeout() nhưng cho Observable stream
 * - DÙNG KHI: Giới hạn thời gian chờ cho async operations
 *
 * RxJS OPERATOR: catchError()
 * - TÁC DỤNG: Bắt error trong Observable stream và xử lý
 * - GIỐNG: try-catch nhưng cho Observable
 * - KHÁC try-catch: catchError nhận Observable → có thể retry, fallback
 * - DÙNG KHI: Error recovery, transform error, retry logic
 *
 * PATTERN: timeout() + catchError()
 * timeout(5000) → nếu quá 5s → throw TimeoutError
 * catchError() → bắt TimeoutError → throw RequestTimeoutException (HTTP 408)
 *
 * LỖI PHỔ BIẾN:
 * - Không có timeout → 1 request chậm block connection pool
 * - Timeout quá ngắn → request hợp lệ bị cancel (false positive)
 * - Timeout quá dài → không có tác dụng bảo vệ
 * - Quên catchError() → TimeoutError không được handle → 500 error
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { DEFAULT_TIMEOUT } from '../constants/app.constant';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  /**
   * Constructor nhận timeout duration (ms)
   * Default: DEFAULT_TIMEOUT (30s)
   *
   * TẠI SAO cho phép custom timeout:
   * - Upload file: cần timeout dài hơn (60s)
   * - Health check: timeout ngắn (5s)
   * - Có thể tạo nhiều instance cho các use case khác nhau
   */
  constructor(private readonly timeoutMs: number = DEFAULT_TIMEOUT) {}

  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      /**
       * OPERATOR: timeout(ms)
       *
       * CÁCH HOẠT ĐỘNG:
       * 1. Bắt đầu đếm thời gian khi subscribe
       * 2. Nếu Observable emit giá trị trước timeout → pass through bình thường
       * 3. Nếu quá timeout → throw TimeoutError
       *
       * LƯU Ý: timeout() đếm từ lúc SUBSCRIBE, không phải từ lúc tạo Observable
       * Trong NestJS, subscribe xảy ra khi response pipeline bắt đầu
       */
      timeout(this.timeoutMs),

      /**
       * OPERATOR: catchError(error => Observable)
       *
       * CÁCH HOẠT ĐỘNG:
       * 1. Khi Observable throw error → catchError bắt error
       * 2. Callback nhận error object → quyết định:
       *    a. Return Observable mới → retry/fallback (error recovery)
       *    b. throwError() → re-throw error khác (error transformation)
       *
       * Ở ĐÂY: Transform TimeoutError → RequestTimeoutException (HTTP 408)
       *
       * TẠI SAO check instanceof TimeoutError:
       * - Chỉ handle timeout error, không swallow các error khác
       * - Error khác (DB error, validation error) phải giữ nguyên
       * - Principle: Chỉ handle error bạn biết cách xử lý
       */
      catchError((error) => {
        if (error instanceof TimeoutError) {
          /**
           * throwError(): Tạo Observable emit error ngay lập tức
           *
           * TẠI SAO dùng throwError() thay vì throw:
           * - catchError phải return Observable (contract)
           * - throw trong callback sẽ hoạt động nhưng không phải RxJS convention
           * - throwError(() => new Error()) là lazy → chỉ tạo Error khi subscribe
           */
          return throwError(
            () =>
              new RequestTimeoutException(
                'Request xử lý quá lâu, vui lòng thử lại',
              ),
          );
        }

        /**
         * Error không phải TimeoutError → re-throw nguyên bản
         * Để exception filter xử lý
         */
        return throwError(() => error);
      }),
    );
  }
}

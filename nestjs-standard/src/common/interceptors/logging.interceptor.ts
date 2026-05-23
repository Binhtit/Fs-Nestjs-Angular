/**
 * KHÁI NIỆM: Logging Interceptor — Ghi log mỗi request
 *
 * INTERCEPTOR là gì:
 * - Chạy TRƯỚC và SAU handler (controller method)
 * - Có thể transform response, thêm logic, đo thời gian
 * - Tương tự middleware nhưng mạnh hơn (access handler info, pipe response)
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Request đến → intercept() chạy
 * 2. Ghi log "→ GET /api/v1/posts" (TRƯỚC handler)
 * 3. next.handle() → gọi controller handler
 * 4. tap() → ghi log "← GET /api/v1/posts - 15ms" (SAU handler)
 *
 * RxJS OPERATORS:
 * - tap(): Side-effect — ghi log mà KHÔNG thay đổi response
 * - map(): Transform — thay đổi response (dùng trong TransformInterceptor)
 *
 * TẠI SAO dùng tap() thay vì console.log trong controller:
 * - DRY: 1 interceptor thay vì console.log ở 30+ controller methods
 * - Consistent: Format log giống nhau cho mọi request
 * - Toggleable: Tắt bằng cách bỏ interceptor, không sửa code
 */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  /**
   * intercept(): Chạy TRƯỚC và SAU controller handler
   *
   * Observable<unknown>: Dùng unknown thay vì any
   * → any: TypeScript bỏ qua mọi kiểm tra → nguy hiểm
   * → unknown: Phải kiểm tra type trước khi dùng → an toàn
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const now = Date.now();

    /** Log TRƯỚC handler (request vào) */
    this.logger.log(`→ ${method} ${url} — Bắt đầu xử lý`);

    /**
     * next.handle(): Gọi controller handler → trả về Observable
     * .pipe(tap(...)): Sau khi handler xong → ghi log thời gian
     *
     * tap() KHÔNG thay đổi response — chỉ "nhìn" data để ghi log
     */
    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        this.logger.log(`← ${method} ${url} — ${elapsed}ms`);
      }),
    );
  }
}

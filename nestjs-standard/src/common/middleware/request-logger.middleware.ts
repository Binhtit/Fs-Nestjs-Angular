/**
 * KHÁI NIỆM: NestJS Custom Middleware
 *
 * MIDDLEWARE là gì:
 * - Hàm chạy TRƯỚC route handler, có access vào Request + Response + NextFunction
 * - Giống Express middleware nhưng có thể inject NestJS services (DI)
 * - Chạy TRƯỚC guards, interceptors, pipes
 *
 * PHÂN BIỆT Middleware vs Guard vs Interceptor:
 * ┌─────────────────┬────────────────────────────────────────────────────────┐
 * │                 │ Đặc điểm                                               │
 * ├─────────────────┼────────────────────────────────────────────────────────┤
 * │ Middleware      │ Chạy trước cả Guard, không biết route handler là gì    │
 * │                 │ Có thể modify request (add headers, parse body...)      │
 * │                 │ Gọi next() để chuyển tiếp                              │
 * ├─────────────────┼────────────────────────────────────────────────────────┤
 * │ Guard           │ Quyết định có vào handler không (true/false)           │
 * │                 │ Có ExecutionContext → biết đang gọi method nào         │
 * ├─────────────────┼────────────────────────────────────────────────────────┤
 * │ Interceptor     │ Bọc handler, có thể modify response                    │
 * │                 │ Có Observable → dùng RxJS operators                    │
 * └─────────────────┴────────────────────────────────────────────────────────┘
 *
 * KHI NÀO DÙNG MIDDLEWARE thay vì Interceptor:
 * - Cần chạy TRƯỚC guard (ví dụ: rate limit bằng middleware custom)
 * - Cần modify Request object trước khi Guard đọc (add request ID...)
 * - Logic không phụ thuộc vào route handler cụ thể
 *
 * MIDDLEWARE NÀY (RequestLoggerMiddleware):
 * - Log method + URL + body (mask sensitive fields như password)
 * - Demo cách inject Logger service vào middleware
 * - Demo cách áp dụng cho specific routes trong app.module.ts
 *
 * CÁCH ĐĂNG KÝ (trong AppModule):
 * ```typescript
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer
 *       .apply(RequestLoggerMiddleware)
 *       .exclude('health')         // Bỏ qua /health
 *       .forRoutes('*');           // Áp dụng tất cả routes
 *   }
 * }
 * ```
 */
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('Request');

  /**
   * use(): Method bắt buộc của NestMiddleware interface
   *
   * Giống Express middleware: (req, res, next) => void
   * BẮT BUỘC gọi next() để request tiếp tục xử lý
   * Nếu quên next() → request bị "treo" mãi mãi
   */
  use(req: Request, _res: Response, next: NextFunction): void {
    const method: string = req.method;
    const originalUrl: string = req.originalUrl;

    /**
     * MASK sensitive fields trước khi log
     *
     * BẢO MẬT: KHÔNG bao giờ log plaintext password, token, secret
     * maskBody(): Thay thế value của sensitive keys bằng '***'
     *
     * req.body có type 'any' từ Express → ép kiểu sang Record<string, unknown>
     * để maskSensitiveFields() hoạt động đúng type
     */
    const rawBody = req.body as Record<string, unknown> | undefined;
    const maskedBody = rawBody ? this.maskSensitiveFields(rawBody) : {};

    this.logger.log(
      `[Middleware] ${method} ${originalUrl} | body: ${JSON.stringify(maskedBody)}`,
    );

    /** Chuyển tiếp request → Guard → Interceptor → Handler */
    next();
  }

  /**
   * Mask các field nhạy cảm trong request body
   *
   * Đệ quy: xử lý cả nested objects
   * Chỉ mask giá trị của key nhạy cảm, không xóa key
   * → Vẫn biết field được gửi lên (debugging) nhưng không lộ nội dung
   */
  private maskSensitiveFields(
    obj: Record<string, unknown>,
  ): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    /** Danh sách field cần mask — thêm vào đây nếu cần */
    const sensitiveKeys = ['password', 'token', 'secret', 'refreshToken', 'accessToken'];

    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        masked[key] = '***';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        masked[key] = this.maskSensitiveFields(value as Record<string, unknown>);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }
}

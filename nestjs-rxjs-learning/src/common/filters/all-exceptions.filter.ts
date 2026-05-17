/**
 * KHÁI NIỆM: Global Exception Filter
 *
 * TẠI SAO cần Exception Filter:
 * 1. Consistency: Mọi error đều trả về cùng format (ApiResponse)
 * 2. Security: Không lộ internal error details (stack trace) cho client
 * 3. Logging: Centralized error logging
 * 4. Recovery: Transform unknown errors thành user-friendly message
 *
 * NESTJS EXCEPTION PIPELINE:
 * ┌────────────┐    ┌──────────────┐    ┌──────────────────┐
 * │ Controller │ →  │ Exception    │ →  │ Exception Filter │
 * │ throw error│    │ propagation  │    │ catch & format   │
 * └────────────┘    └──────────────┘    └──────────────────┘
 *
 * THỨ TỰ FILTER (quan trọng):
 * 1. Method-level filters (gần nhất) → chạy trước
 * 2. Controller-level filters
 * 3. Global filters (xa nhất) → chạy sau (fallback)
 *
 * → Nếu method filter handle được → global filter KHÔNG chạy
 * → Global filter là "safety net" cuối cùng
 *
 * LỖI PHỔ BIẾN:
 * - Không có global filter → unhandled exception trả về NestJS default format
 * - Lộ stack trace trong production → security risk
 * - Catch error nhưng không log → mất thông tin debug
 */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * @Catch(): Decorator chỉ định exception types mà filter này bắt
 *
 * @Catch() không có argument → bắt TẤT CẢ exceptions
 * @Catch(HttpException) → chỉ bắt HttpException và subclasses
 * @Catch(TypeError, RangeError) → bắt nhiều loại cụ thể
 *
 * Ở ĐÂY: @Catch() bắt tất cả → global safety net
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  /**
   * catch() method: Xử lý exception
   *
   * @param exception - Exception object (bất kỳ type nào)
   * @param host - ArgumentsHost: chứa request/response objects
   *
   * ArgumentsHost vs ExecutionContext:
   * - ArgumentsHost: Base class, có switchToHttp/Ws/Rpc
   * - ExecutionContext: extends ArgumentsHost, thêm getHandler/getClass
   * - Filter dùng ArgumentsHost (không cần handler/class info)
   * - Guard/Interceptor dùng ExecutionContext (cần handler/class info)
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    /**
     * Xác định HTTP status code
     *
     * Nếu exception là HttpException → lấy status từ exception
     * Nếu không (vd: TypeError, database error) → mặc định 500
     */
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    /**
     * Xác định error message
     *
     * HttpException: Có thể chứa string hoặc object trong response
     * Unknown error: Dùng generic message, KHÔNG lộ internal details
     *
     * TẠI SAO không return error.message cho unknown error:
     * - error.message có thể chứa SQL query, file path, internal logic
     * - Hacker đọc → biết database schema, file structure
     * - Production PHẢI dùng generic message
     */
    let message = 'Lỗi hệ thống, vui lòng thử lại sau';
    if (exception instanceof HttpException) {
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'string'
          ? exResponse
          : ((exResponse as { message?: string }).message ?? exception.message);
    }

    /**
     * Log error chi tiết (server-side only)
     *
     * - Log full exception cho debugging
     * - Bao gồm stack trace để trace root cause
     * - Client KHÔNG nhìn thấy log này
     */
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    /**
     * Return standardized error response
     * Dùng ApiResponse.error() để đảm bảo format thống nhất
     */
    const errorResponse = ApiResponse.error(status, message, request.url);

    response.status(status).json(errorResponse);
  }
}

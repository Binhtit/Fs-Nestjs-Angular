/**
 * KHÁI NIỆM: Business Exception Filter
 *
 * TẠI SAO tách filter riêng cho BusinessException:
 * 1. Specific handling: Business error cần error code, system error không có
 * 2. Log level: Business error → warn (expected), System error → error (unexpected)
 * 3. Response format: Business error có errorCode field bổ sung
 *
 * THỨ TỰ FILTER EXECUTION:
 * Exception throw → BusinessExceptionFilter (specific) → AllExceptionsFilter (fallback)
 *
 * NestJS tìm filter cụ thể nhất trước:
 * - BusinessException → BusinessExceptionFilter bắt ✓
 * - HttpException → AllExceptionsFilter bắt
 * - TypeError → AllExceptionsFilter bắt
 */
import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  BusinessException,
  BusinessErrorResponse,
} from '../exceptions/business.exception';

/**
 * @Catch(BusinessException): Chỉ bắt BusinessException
 * Các exception khác sẽ "rơi qua" filter này → AllExceptionsFilter xử lý
 */
@Catch(BusinessException)
export class BusinessExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(BusinessExceptionFilter.name);

  catch(exception: BusinessException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    /**
     * Lấy error response từ BusinessException
     * Chứa: { errorCode: 'AUTH_001', message: 'Sai mật khẩu' }
     */
    const errorResponse = exception.getResponse() as BusinessErrorResponse;

    /**
     * Log level: WARN thay vì ERROR
     * TẠI SAO: Business error là "expected" (user sai input, không có quyền, ...)
     * System error mới là "unexpected" (DB down, memory leak, ...)
     *
     * Phân biệt warn vs error giúp:
     * - Alert: Chỉ trigger alert cho error, không cho warn
     * - Dashboard: Theo dõi error rate chính xác hơn
     * - Debugging: Focus vào error thật, bỏ qua business logic issues
     */
    this.logger.warn(
      `[${errorResponse.errorCode}] ${errorResponse.message} - ${request.method} ${request.url}`,
    );

    /**
     * Response format cho business error
     * Thêm errorCode field so với system error
     */
    response.status(status).json({
      success: false,
      statusCode: status,
      errorCode: errorResponse.errorCode,
      message: errorResponse.message,
      data: null,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

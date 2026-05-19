/**
 * KHÁI NIỆM: Global Exception Filter — Bắt TẤT CẢ lỗi
 *
 * VẤN ĐỀ nếu KHÔNG có filter:
 * - Lỗi 500 trả về HTML error page → FE không parse được
 * - Lỗi TypeORM/Prisma trả stack trace → lộ thông tin DB
 * - Format lỗi không thống nhất → FE phải xử lý nhiều case
 *
 * GIẢI PHÁP: Bắt MỌI exception → trả về JSON format chuẩn:
 * {
 *   success: false,
 *   statusCode: 404,
 *   message: "Không tìm thấy bài viết",
 *   timestamp: "2026-...",
 *   path: "/api/v1/posts/999"
 * }
 *
 * CÁC LOẠI EXCEPTION TRONG NESTJS:
 * - HttpException: 400, 401, 403, 404, 409... (throw thủ công)
 * - PrismaClientKnownRequestError: unique constraint, foreign key...
 * - Error: lỗi runtime không lường trước (null reference, type error)
 *
 * LỖI PHỔ BIẾN:
 * - Không catch lỗi Prisma → trả 500 với stack trace
 * - Không log error → khó debug production
 * - Trả message quá chi tiết → lộ thông tin hệ thống
 */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Interface cho response body của HttpException
 * NestJS trả về object dạng này khi throw HttpException
 *
 * Ví dụ: throw new BadRequestException('Email sai')
 * → response: { statusCode: 400, message: 'Email sai', error: 'Bad Request' }
 */
interface ExceptionResponseBody {
  message: string | string[];
  statusCode?: number;
  error?: string;
}

/**
 * @Catch() không có tham số → bắt TẤT CẢ exceptions
 * Nếu muốn bắt riêng: @Catch(HttpException) → chỉ bắt HttpException
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    /** Xác định status code và message */
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Lỗi hệ thống, vui lòng thử lại';

    if (exception instanceof HttpException) {
      /**
       * HttpException: Lỗi HTTP do developer throw
       * Ví dụ: throw new NotFoundException('Bài viết không tồn tại')
       */
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message =
        typeof exceptionResponse === 'string'
          ? exceptionResponse
          : (exceptionResponse as ExceptionResponseBody).message ||
            exception.message;
    } else if (exception instanceof Error) {
      /**
       * Error thông thường: lỗi runtime không lường trước
       * Log đầy đủ nhưng KHÔNG trả chi tiết cho client (bảo mật)
       */
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    /** Trả response JSON format chuẩn */
    response.status(statusCode).json({
      success: false,
      statusCode,
      message: Array.isArray(message) ? message : [message],
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

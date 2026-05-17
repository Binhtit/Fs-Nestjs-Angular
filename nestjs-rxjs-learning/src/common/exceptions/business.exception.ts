/**
 * KHÁI NIỆM: Custom Exception Class
 *
 * TẠI SAO tạo BusinessException riêng thay vì dùng HttpException:
 * 1. Semantic: Phân biệt lỗi "business logic" vs "system error"
 *    - Business: User không có quyền, email trùng, task đã xong
 *    - System: Database down, memory leak, unexpected error
 * 2. Error code: HttpException chỉ có status + message
 *    BusinessException thêm errorCode để frontend xử lý chính xác
 * 3. Filter riêng: Có thể tạo filter riêng cho business vs system error
 *    - Business error: Log warning, return user-friendly message
 *    - System error: Log error + stack trace, return generic message
 *
 * LỖI PHỔ BIẾN:
 * - Throw raw Error() → không có HTTP status → NestJS return 500
 * - Dùng HttpException cho mọi thứ → không phân biệt được loại lỗi
 * - Lộ internal error message cho client → security risk
 */
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Interface định nghĩa structure của business error response
 */
export interface BusinessErrorResponse {
  errorCode: string;
  message: string;
}

/**
 * Custom exception cho business logic errors
 *
 * extends HttpException:
 * - Kế thừa HTTP status code handling
 * - NestJS exception filter tự động catch và format response
 * - Compatible với @nestjs/swagger error documentation
 */
export class BusinessException extends HttpException {
  /**
   * Mã lỗi business (vd: 'AUTH_001', 'USER_002')
   * Frontend dùng code này để hiện message phù hợp
   */
  readonly errorCode: string;

  constructor(
    errorCode: string,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    /**
     * super() gọi HttpException constructor
     * - Parameter 1: Response body (object hoặc string)
     * - Parameter 2: HTTP status code
     *
     * HttpException lưu response body, NestJS exception filter đọc và return cho client
     */
    super({ errorCode, message }, statusCode);
    this.errorCode = errorCode;
  }

  /**
   * Factory methods cho các lỗi thường gặp
   * Giúp code gọn hơn: throw BusinessException.unauthorized()
   * thay vì: throw new BusinessException('AUTH_001', 'Sai mật khẩu', 401)
   */
  static unauthorized(
    errorCode: string,
    message: string,
  ): BusinessException {
    return new BusinessException(
      errorCode,
      message,
      HttpStatus.UNAUTHORIZED,
    );
  }

  static forbidden(
    errorCode: string,
    message: string,
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.FORBIDDEN);
  }

  static notFound(
    errorCode: string,
    message: string,
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.NOT_FOUND);
  }

  static conflict(
    errorCode: string,
    message: string,
  ): BusinessException {
    return new BusinessException(errorCode, message, HttpStatus.CONFLICT);
  }
}

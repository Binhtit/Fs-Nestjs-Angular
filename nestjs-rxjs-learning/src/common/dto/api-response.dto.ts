/**
 * KHÁI NIỆM: Standardized API Response Format
 *
 * TẠI SAO cần chuẩn hóa response:
 * 1. Consistency: Frontend luôn biết response structure → parse dễ dàng
 * 2. Error handling: Frontend check success/statusCode thống nhất
 * 3. Pagination: Metadata pagination đi kèm data
 * 4. Debugging: timestamp + path giúp trace request
 *
 * FORMAT:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Thành công",
 *   data: { ... },
 *   pagination?: { page, limit, total, totalPages },
 *   timestamp: "2024-01-01T00:00:00.000Z",
 *   path: "/api/v1/tasks"
 * }
 *
 * LỖI PHỔ BIẾN:
 * - Mỗi endpoint trả format khác nhau → frontend phải xử lý case-by-case
 * - Không có error code → frontend chỉ biết "lỗi" nhưng không biết "lỗi gì"
 * - Không có pagination meta → frontend không biết tổng số trang
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Interface mô tả metadata phân trang
 */
export interface PaginationMeta {
  /** Trang hiện tại */
  page: number;
  /** Số item mỗi trang */
  limit: number;
  /** Tổng số item */
  total: number;
  /** Tổng số trang */
  totalPages: number;
}

/**
 * Class response chuẩn cho toàn bộ API
 *
 * TẠI SAO dùng class thay vì interface:
 * - Swagger cần class để generate docs (@ApiProperty)
 * - class-transformer cần class để transform
 * - Interface biến mất sau compile → không dùng được ở runtime
 *
 * Generic Type <T>:
 * - Cho phép type-safe data field
 * - Ví dụ: ApiResponse<UserEntity>, ApiResponse<TaskEntity[]>
 */
export class ApiResponse<T> {
  @ApiProperty({ description: 'Kết quả xử lý', example: true })
  success: boolean = false;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number = 200;

  @ApiProperty({ description: 'Thông báo', example: 'Thành công' })
  message: string = '';

  @ApiProperty({ description: 'Dữ liệu trả về' })
  data: T | null = null;

  @ApiPropertyOptional({ description: 'Metadata phân trang' })
  pagination?: PaginationMeta;

  @ApiProperty({
    description: 'Thời điểm response',
    example: '2024-01-01T00:00:00.000Z',
  })
  timestamp: string = '';

  @ApiProperty({
    description: 'Request path',
    example: '/api/v1/tasks',
  })
  path: string = '';

  /**
   * Factory method: Tạo response thành công
   *
   * TẠI SAO dùng static factory thay vì constructor:
   * - Readable: ApiResponse.success(data) rõ ràng hơn new ApiResponse(true, 200, ...)
   * - Flexible: Có thể tạo nhiều factory method cho các case khác nhau
   * - Immutable-friendly: Factory method tạo object mới, không mutate
   */
  static success<T>(
    data: T,
    message = 'Thành công',
    path = '',
  ): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = true;
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    response.timestamp = new Date().toISOString();
    response.path = path;
    return response;
  }

  /**
   * Factory method: Tạo response lỗi
   */
  static error<T = null>(
    statusCode: number,
    message: string,
    path = '',
  ): ApiResponse<T> {
    const response = new ApiResponse<T>();
    response.success = false;
    response.statusCode = statusCode;
    response.message = message;
    response.data = null;
    response.timestamp = new Date().toISOString();
    response.path = path;
    return response;
  }

  /**
   * Factory method: Tạo response có phân trang
   */
  static paginated<T>(
    data: T[],
    pagination: PaginationMeta,
    message = 'Thành công',
    path = '',
  ): ApiResponse<T[]> {
    const response = new ApiResponse<T[]>();
    response.success = true;
    response.statusCode = 200;
    response.message = message;
    response.data = data;
    response.pagination = pagination;
    response.timestamp = new Date().toISOString();
    response.path = path;
    return response;
  }
}

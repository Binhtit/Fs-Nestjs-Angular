/**
 * KHÁI NIỆM: TypeScript Models/Interfaces
 *
 * TẠI SAO cần interfaces:
 * - TypeScript là TYPED — compiler báo lỗi nếu dùng sai field
 * - Backend trả về cấu trúc cố định → FE cần match chính xác
 * - Autocompletion khi code → nhanh hơn, ít bug hơn
 *
 * GENERIC TYPE ApiResponse<T>:
 * - T là placeholder → khi dùng: ApiResponse<Task>, ApiResponse<AuthTokens>
 * - Backend luôn trả về cùng cấu trúc wrapper, chỉ khác field `data`
 *
 * BACKEND RESPONSE FORMAT:
 * - Single item:  { success, statusCode, message, data: T, timestamp, path }
 * - Paginated:    { success, statusCode, message, data: T[], pagination: {...}, timestamp, path }
 * - Error:        { success: false, statusCode: 4xx/5xx, message, data: null }
 */

/** Wrapper chung cho MỌI response từ backend */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
  pagination?: PaginationMeta;
}

/**
 * Metadata phân trang — match backend PaginationMeta
 * Backend trả pagination ở cùng level với data (không nest trong data)
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

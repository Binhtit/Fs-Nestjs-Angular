/**
 * KHÁI NIỆM: Business Error Codes
 *
 * TẠI SAO cần error code riêng (không chỉ dùng HTTP status):
 * 1. Chi tiết hơn: HTTP 400 chỉ nói "bad request", error code nói rõ LỖI GÌ
 * 2. Frontend xử lý: Dựa vào error code để hiện message phù hợp
 * 3. i18n: Map error code → message theo ngôn ngữ user
 * 4. Logging: Filter/search log theo error code cụ thể
 *
 * CONVENTION:
 * - AUTH_xxx: Lỗi liên quan authentication/authorization
 * - USER_xxx: Lỗi liên quan user management
 * - TASK_xxx: Lỗi liên quan task management
 * - SYSTEM_xxx: Lỗi hệ thống
 */
export const ERROR_CODES = {
  // === Authentication ===
  AUTH_INVALID_CREDENTIALS: {
    code: 'AUTH_001',
    message: 'Email hoặc mật khẩu không đúng',
  },
  AUTH_TOKEN_EXPIRED: {
    code: 'AUTH_002',
    message: 'Token đã hết hạn, vui lòng đăng nhập lại',
  },
  AUTH_TOKEN_INVALID: {
    code: 'AUTH_003',
    message: 'Token không hợp lệ',
  },
  AUTH_REFRESH_TOKEN_INVALID: {
    code: 'AUTH_004',
    message: 'Refresh token không hợp lệ hoặc đã hết hạn',
  },
  AUTH_FORBIDDEN: {
    code: 'AUTH_005',
    message: 'Bạn không có quyền truy cập tài nguyên này',
  },

  // === User ===
  USER_NOT_FOUND: {
    code: 'USER_001',
    message: 'Không tìm thấy người dùng',
  },
  USER_EMAIL_EXISTS: {
    code: 'USER_002',
    message: 'Email đã được sử dụng bởi tài khoản khác',
  },

  // === Task ===
  TASK_NOT_FOUND: {
    code: 'TASK_001',
    message: 'Không tìm thấy công việc',
  },
  TASK_ALREADY_COMPLETED: {
    code: 'TASK_002',
    message: 'Công việc đã hoàn thành, không thể cập nhật',
  },
  TASK_NOT_OWNED: {
    code: 'TASK_003',
    message: 'Bạn không phải chủ sở hữu công việc này',
  },

  // === System ===
  SYSTEM_INTERNAL_ERROR: {
    code: 'SYS_001',
    message: 'Lỗi hệ thống, vui lòng thử lại sau',
  },
  SYSTEM_TIMEOUT: {
    code: 'SYS_002',
    message: 'Request xử lý quá lâu, vui lòng thử lại',
  },
} as const;

/**
 * Type helper: Lấy type của error code key
 * Dùng cho type-safe error handling
 */
export type ErrorCodeKey = keyof typeof ERROR_CODES;

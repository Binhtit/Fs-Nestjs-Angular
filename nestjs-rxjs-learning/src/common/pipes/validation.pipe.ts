/**
 * KHÁI NIỆM: Global Validation Pipe
 *
 * TẠI SAO cần Validation Pipe:
 * 1. Input validation: Reject request có data không hợp lệ TRƯỚC KHI vào service
 * 2. Type safety: Transform string query params thành number, boolean, etc.
 * 3. Security: Loại bỏ fields không mong muốn (mass assignment attack)
 * 4. DRY: Validation logic nằm trong DTO decorators, không lặp trong controller
 *
 * PIPE EXECUTION ORDER:
 * ┌──────────┐    ┌───────┐    ┌──────────┐    ┌────────────┐
 * │ Request  │ →  │ Guard │ →  │   PIPE   │ →  │ Controller │
 * │          │    │       │    │ validate │    │ handler()  │
 * │          │    │       │    │ transform│    │            │
 * └──────────┘    └───────┘    └──────────┘    └────────────┘
 *
 * Pipe chạy SAU guard, TRƯỚC controller
 * → User đã authenticated → giờ validate input
 *
 * CÁC OPTIONS QUAN TRỌNG:
 *
 * whitelist: true
 * - Loại bỏ mọi property KHÔNG có trong DTO
 * - Ví dụ: DTO có { name, email }, client gửi { name, email, isAdmin: true }
 *   → isAdmin bị strip → tránh mass assignment attack
 *
 * forbidNonWhitelisted: true
 * - Strict hơn whitelist: REJECT request nếu có property lạ
 * - Thay vì strip yên lặng → throw error rõ ràng
 *
 * transform: true
 * - Tự động transform type: string → number, string → boolean
 * - Cần cho query params (luôn là string từ URL)
 * - Ví dụ: ?page=2 → { page: 2 } (number, không phải string "2")
 *
 * LỖI PHỔ BIẾN:
 * - Không dùng whitelist → client gửi isAdmin: true → set admin role
 * - Không dùng transform → query.page là string → math operations sai
 * - Validation error message không rõ ràng → user không biết sửa gì
 */
import { ValidationPipe } from '@nestjs/common';

/**
 * Factory function tạo configured ValidationPipe
 *
 * TẠI SAO dùng factory thay vì export instance:
 * - Có thể tạo nhiều instance với config khác nhau
 * - Test dễ hơn (inject config khác cho test environment)
 */
export const createValidationPipe = (): ValidationPipe => {
  return new ValidationPipe({
    /**
     * whitelist: Tự động strip properties không có trong DTO
     * SECURITY: Ngăn mass assignment attacks
     */
    whitelist: true,

    /**
     * forbidNonWhitelisted: Throw error nếu có property lạ
     * Giúp frontend dev biết họ gửi sai field
     */
    forbidNonWhitelisted: true,

    /**
     * transform: Tự động transform payload type
     * - string → number (cho query params)
     * - plain object → class instance (cho class-transformer)
     */
    transform: true,

    /**
     * transformOptions: Cấu hình cho class-transformer
     * enableImplicitConversion: Tự động convert type dựa trên TypeScript type
     *
     * Ví dụ: DTO khai báo `page: number`
     * - Client gửi ?page="2" (string)
     * - class-transformer thấy type = number → convert "2" → 2
     */
    transformOptions: {
      enableImplicitConversion: true,
    },
  });
};

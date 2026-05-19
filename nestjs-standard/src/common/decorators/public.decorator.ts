/**
 * KHÁI NIỆM: Custom Decorator — @Public()
 *
 * VẤN ĐỀ:
 * - JwtAuthGuard được set GLOBAL → mọi route đều yêu cầu JWT token
 * - Nhưng /auth/login, /auth/register KHÔNG cần token (chưa đăng nhập mà!)
 *
 * GIẢI PHÁP: @Public() decorator
 * - Gắn vào method/controller → JwtAuthGuard sẽ SKIP kiểm tra JWT
 * - Sử dụng Reflector để đọc metadata "isPublic" trong Guard
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. @Public() → gắn metadata { isPublic: true } vào route handler
 * 2. JwtAuthGuard.canActivate() → đọc metadata bằng Reflector
 * 3. Nếu isPublic === true → return true (cho qua không cần JWT)
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Public()
 * @Post('login')
 * login(@Body() dto: LoginDto) { ... }
 * ```
 */
import { SetMetadata } from '@nestjs/common';

/** Key cho metadata — dùng trong Guard để đọc */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * @Public() decorator
 * SetMetadata(key, value) → gắn { isPublic: true } vào handler metadata
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

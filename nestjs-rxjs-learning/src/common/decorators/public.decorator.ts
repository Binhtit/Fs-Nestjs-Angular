/**
 * KHÁI NIỆM: Metadata Decorator + Reflector Pattern
 *
 * TẠI SAO cần @Public() decorator:
 * - Mặc định TẤT CẢ routes đều cần JWT auth (global JwtAuthGuard)
 * - Nhưng một số route phải public: login, register, health check
 * - @Public() "đánh dấu" route là public → JwtAuthGuard sẽ skip
 *
 * CÁCH HOẠT ĐỘNG (Metadata + Reflector):
 * 1. @Public() gọi SetMetadata(IS_PUBLIC_KEY, true) → gắn metadata vào handler
 * 2. JwtAuthGuard inject Reflector → đọc metadata từ handler
 * 3. Nếu metadata IS_PUBLIC_KEY = true → return true (bypass auth)
 *
 * TẠI SAO dùng Metadata thay vì if/else:
 * - Declarative: Nhìn decorator biết ngay route public hay không
 * - Decoupled: Guard không cần biết route nào public, chỉ cần đọc metadata
 * - Scalable: Thêm route public = thêm 1 decorator, không sửa guard
 *
 * LỖI PHỔ BIẾN:
 * - Quên import IS_PUBLIC_KEY constant → dùng string literal → typo = bug
 * - Không apply global JwtAuthGuard → @Public() không có tác dụng
 */
import { SetMetadata } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '../constants/app.constant';

/**
 * Decorator đánh dấu route là public (không cần JWT token)
 *
 * SetMetadata(key, value):
 * - Gắn cặp key-value vào metadata của method/class
 * - Metadata được lưu trong Reflect.metadata (ES7 proposal)
 * - NestJS Reflector service dùng để đọc metadata này
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Public()           // ← Đánh dấu endpoint này không cần auth
 * @Post('login')
 * login() { ... }
 * ```
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

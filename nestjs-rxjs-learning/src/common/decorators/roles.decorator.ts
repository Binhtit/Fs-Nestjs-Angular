/**
 * KHÁI NIỆM: Role-Based Access Control (RBAC) Decorator
 *
 * TẠI SAO cần @Roles():
 * - Authentication (JWT) chỉ xác nhận "bạn LÀ AI"
 * - Authorization (Roles) xác nhận "bạn ĐƯỢC LÀM GÌ"
 * - 2 khái niệm khác nhau, cần 2 decorator/guard khác nhau
 *
 * FLOW:
 * 1. @Roles('admin') → gắn metadata ['admin'] vào handler
 * 2. JwtAuthGuard chạy trước → xác thực user
 * 3. RolesGuard chạy sau → đọc metadata → check user.role
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Roles('admin')           // Chỉ admin
 * @Roles('admin', 'user')   // Admin HOẶC user (OR logic)
 * @Get('admin/dashboard')
 * getDashboard() { ... }
 * ```
 *
 * LỖI PHỔ BIẾN:
 * - Quên apply RolesGuard → @Roles() không có tác dụng
 * - Không apply JwtAuthGuard trước RolesGuard → user = undefined → crash
 */
import { SetMetadata } from '@nestjs/common';
import { ROLES_KEY } from '../constants/app.constant';
import type { UserRole } from '../enums/role.enum';

/**
 * Decorator gán required roles cho endpoint
 *
 * @param roles - Danh sách roles được phép (OR logic: có 1 trong các role là đủ)
 *
 * Bên trong:
 * - SetMetadata(ROLES_KEY, roles) → lưu array roles vào metadata
 * - RolesGuard sẽ đọc metadata này bằng Reflector
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

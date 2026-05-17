/**
 * KHÁI NIỆM: Role-Based Authorization Guard
 *
 * TẠI SAO tách RolesGuard khỏi JwtAuthGuard:
 * 1. Single Responsibility: JWT guard xác thực, Roles guard phân quyền
 * 2. Composable: Có thể dùng riêng hoặc kết hợp
 * 3. Optional: Không phải endpoint nào cũng cần check role
 *
 * THỨ TỰ GUARD EXECUTION (quan trọng):
 * 1. Global guards chạy TRƯỚC controller-level guards
 * 2. Controller-level guards chạy TRƯỚC method-level guards
 * 3. Trong cùng level, chạy theo thứ tự đăng ký
 *
 * → JwtAuthGuard (global) chạy trước → user có trong request
 * → RolesGuard (global) chạy sau → đọc user.role từ request
 *
 * LỖI PHỔ BIẾN:
 * - RolesGuard chạy trước JwtAuthGuard → user = undefined → crash
 * - Không check "route có @Roles() không" → mọi route đều bị check role
 */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../constants/app.constant';
import type { UserRole } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * CanActivate interface: bắt buộc implement canActivate()
   *
   * Trả về true = cho phép, false = deny (throw ForbiddenException)
   */
  canActivate(context: ExecutionContext): boolean {
    /**
     * BƯỚC 1: Đọc required roles từ @Roles() metadata
     *
     * getAllAndOverride: Ưu tiên method-level @Roles(), fallback class-level
     * → Có thể set @Roles('admin') ở controller level (apply cho tất cả methods)
     * → Override bằng @Roles('user') ở method level
     */
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    /**
     * BƯỚC 2: Nếu route KHÔNG có @Roles() → cho phép tất cả
     *
     * TẠI SAO: Nhiều route chỉ cần authentication (JWT), không cần check role
     * Ví dụ: GET /tasks (mọi user đều xem được task của mình)
     */
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    /**
     * BƯỚC 3: Lấy user từ request (đã được JwtAuthGuard gắn vào)
     */
    const { user } = context.switchToHttp().getRequest();

    /**
     * BƯỚC 4: Check user có role nằm trong requiredRoles không
     *
     * .some(): Chỉ cần 1 role match → authorized (OR logic)
     * Ví dụ: @Roles('admin', 'moderator') → user có 1 trong 2 là đủ
     *
     * Nếu cần AND logic (user phải có TẤT CẢ roles):
     * → Dùng .every() thay vì .some()
     */
    return requiredRoles.some((role) => user?.role === role);
  }
}

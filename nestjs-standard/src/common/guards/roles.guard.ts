/**
 * KHÁI NIỆM: Roles Guard — Phân quyền theo vai trò (RBAC)
 *
 * RBAC (Role-Based Access Control):
 * - ADMIN:  Toàn quyền (CRUD mọi thứ, quản lý users)
 * - AUTHOR: Viết bài, sửa bài của mình, bình luận
 * - READER: Chỉ đọc bài + bình luận
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. @Roles('ADMIN') decorator → gắn metadata { roles: ['ADMIN'] }
 * 2. RolesGuard.canActivate() → đọc metadata bằng Reflector
 * 3. Lấy user.role từ request.user (đã được JWT strategy gắn)
 * 4. Check user.role có nằm trong danh sách roles cho phép không
 *
 * THỨ TỰ CHẠY: JwtAuthGuard → RolesGuard
 * - JwtAuthGuard verify token → gắn user vào request
 * - RolesGuard check user.role → cho phép hoặc từ chối
 *
 * CÁCH DÙNG:
 * ```typescript
 * @UseGuards(RolesGuard)
 * @Roles('ADMIN')
 * @Delete(':id')
 * deleteUser() { ... } // Chỉ ADMIN mới xóa được user
 *
 * @Roles('ADMIN', 'AUTHOR')
 * @Post()
 * createPost() { ... } // ADMIN hoặc AUTHOR đều tạo post được
 * ```
 *
 * LỖI PHỔ BIẾN:
 * - Quên @UseGuards(RolesGuard) → decorator @Roles() vô tác dụng
 * - Dùng RolesGuard mà không có JwtAuthGuard → request.user undefined
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * ROLES_KEY: Key cho metadata — dùng trong Guard để đọc
 * @Roles('ADMIN') → SetMetadata('roles', ['ADMIN'])
 * RolesGuard → Reflector.getAllAndOverride('roles', ...) → đọc lại giá trị
 */
export const ROLES_KEY = 'roles';

/**
 * @Roles() decorator — gắn danh sách roles vào route handler
 *
 * CÁCH HOẠT ĐỘNG:
 * - SetMetadata(key, value) → gắn metadata vào handler
 * - RolesGuard đọc metadata bằng Reflector → check user.role
 *
 * CÁCH DÙNG:
 * @Roles('ADMIN')         → chỉ ADMIN
 * @Roles('ADMIN', 'AUTHOR') → ADMIN hoặc AUTHOR
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    /**
     * Đọc @Roles() metadata từ handler hoặc controller
     * Nếu không có @Roles() → không giới hạn role → cho qua
     */
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    /** Không set @Roles() → mọi authenticated user đều access được */
    if (!requiredRoles) {
      return true;
    }

    /** Lấy user từ request (đã được JwtAuthGuard gắn) */
    const { user } = context.switchToHttp().getRequest();

    /** Check user.role có nằm trong requiredRoles không */
    return requiredRoles.includes(user?.role);
  }
}

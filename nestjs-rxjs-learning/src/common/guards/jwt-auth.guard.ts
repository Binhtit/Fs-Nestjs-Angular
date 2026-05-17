/**
 * KHÁI NIỆM: JWT Authentication Guard
 *
 * TẠI SAO cần Guard:
 * - Guard quyết định request có được phép đi tiếp hay không (true/false)
 * - Chạy SAU middleware, TRƯỚC interceptor và pipe
 * - Tách biệt logic auth khỏi business logic (Single Responsibility)
 *
 * FLOW XÁC THỰC JWT TRONG NESTJS (quan trọng phải hiểu):
 * ┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐
 * │   Request   │ →  │  JwtAuthGuard │ →  │ JwtStrategy  │ →  │ Controller │
 * │  (Bearer    │    │  canActivate()│    │  validate()  │    │  handler() │
 * │   token)    │    │              │    │  → return user│    │            │
 * └─────────────┘    └──────────────┘    └──────────────┘    └────────────┘
 *
 * Chi tiết:
 * 1. Client gửi request với header: Authorization: Bearer <token>
 * 2. JwtAuthGuard.canActivate() được gọi
 * 3. Guard check @Public() metadata trước → nếu public, skip auth
 * 4. Nếu không public → gọi super.canActivate() (Passport's AuthGuard)
 * 5. Passport extract token từ header → verify bằng JWT secret
 * 6. Nếu valid → gọi JwtStrategy.validate(payload)
 * 7. validate() return user object → gắn vào request.user
 * 8. Guard return true → request tiếp tục vào controller
 *
 * LỖI PHỔ BIẾN:
 * - Không check @Public() → login endpoint cũng cần token → deadlock
 * - Quên register JwtStrategy → Guard throw 500 error
 * - Token expired nhưng không clear message → user confused
 */
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../constants/app.constant';

/**
 * @Injectable(): Đánh dấu class tham gia Dependency Injection
 * NestJS quản lý lifecycle của guard instance
 *
 * extends AuthGuard('jwt'):
 * - AuthGuard là factory function của @nestjs/passport
 * - 'jwt' là tên strategy đã register (JwtStrategy)
 * - AuthGuard tự động: extract token, verify, gọi strategy.validate()
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Inject Reflector để đọc metadata
   *
   * Reflector:
   * - Service của NestJS dùng để đọc metadata gắn bởi SetMetadata()
   * - Có thể đọc metadata từ method (handler) hoặc class (controller)
   * - getAllAndOverride: Ưu tiên method metadata, fallback class metadata
   */
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate: Method quyết định request có được đi tiếp không
   *
   * @param context - ExecutionContext chứa thông tin request
   * @returns boolean | Promise<boolean> | Observable<boolean>
   *
   * TẠI SAO trả về được cả sync/async/Observable:
   * NestJS hỗ trợ cả 3 kiểu → linh hoạt cho guard logic
   * Guard async (gọi DB check permission) cũng hoạt động bình thường
   */
  canActivate(context: ExecutionContext) {
    /**
     * BƯỚC 1: Check @Public() metadata
     *
     * getAllAndOverride(key, [targets]):
     * - Tìm metadata theo key IS_PUBLIC_KEY
     * - Tìm ở handler (method) trước, rồi class (controller)
     * - Nếu handler có @Public() → return true (override class level)
     *
     * getHandler(): Lấy reference đến method đang xử lý (vd: login())
     * getClass(): Lấy reference đến class (vd: AuthController)
     */
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    /**
     * Nếu route được đánh dấu @Public() → bypass toàn bộ JWT check
     * Return true = cho phép request đi tiếp
     */
    if (isPublic) {
      return true;
    }

    /**
     * BƯỚC 2: Delegate cho Passport's AuthGuard
     *
     * super.canActivate(context):
     * - Extract token từ Authorization header
     * - Verify token bằng JWT secret (từ JwtStrategy config)
     * - Gọi JwtStrategy.validate(payload)
     * - Nếu thành công: gắn user vào request, return true
     * - Nếu thất bại: throw UnauthorizedException
     */
    return super.canActivate(context);
  }
}

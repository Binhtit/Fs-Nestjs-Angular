/**
 * KHÁI NIỆM: JWT Authentication Guard — Bảo vệ API routes
 *
 * GUARD là gì:
 * - Guard quyết định: "Request này CÓ ĐƯỢC PHÉP đi tiếp không?"
 * - Return true → cho qua → vào Controller
 * - Return false / throw → từ chối → trả 401 Unauthorized
 *
 * GLOBAL GUARD:
 * - Set trong AppModule: APP_GUARD → áp dụng cho TẤT CẢ routes
 * - Routes có @Public() → skip kiểm tra JWT
 * - Routes KHÔNG có @Public() → BẮT BUỘC có JWT token
 *
 * FLOW:
 * 1. Request đến → JwtAuthGuard.canActivate()
 * 2. Check @Public() metadata → nếu có → return true (skip)
 * 3. Không có @Public() → gọi PassportJS JWT strategy
 * 4. JWT strategy → verify token → extract payload → gắn vào request.user
 * 5. Token hợp lệ → return true | Token sai → throw 401
 *
 * LỖI PHỔ BIẾN:
 * - Quên @Public() ở login/register → 401 ngay cả khi chưa có account
 * - Token hết hạn nhưng FE không refresh → 401 bất ngờ
 * - Gửi token thiếu "Bearer " prefix → Passport không parse được
 */
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * canActivate(): Quyết định request có được phép tiếp tục không
   *
   * Reflector.getAllAndOverride(): Đọc metadata từ 2 nơi:
   * 1. Handler (method level): @Public() trên method
   * 2. Controller (class level): @Public() trên controller
   * → Method level ưu tiên hơn class level (override)
   */
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),  // Check method level
      context.getClass(),    // Check class level
    ]);

    /** Route @Public() → cho qua không cần JWT */
    if (isPublic) {
      return true;
    }

    /** Không phải @Public() → delegate cho PassportJS verify JWT */
    return super.canActivate(context);
  }
}

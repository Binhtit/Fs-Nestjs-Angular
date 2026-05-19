/**
 * KHÁI NIỆM: Custom Decorator — @CurrentUser()
 *
 * VẤN ĐỀ:
 * - Sau khi JWT verify, thông tin user nằm trong request.user
 * - Lấy trực tiếp: @Req() req → req.user → dài dòng, không type-safe
 *
 * GIẢI PHÁP: @CurrentUser() decorator
 * - @CurrentUser() → trả về toàn bộ user object
 * - @CurrentUser('id') → trả về chỉ user.id
 * - @CurrentUser('email') → trả về chỉ user.email
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. JWT Strategy validate() → return { id, email, role }
 * 2. NestJS gắn object đó vào request.user
 * 3. @CurrentUser() dùng createParamDecorator() → extract từ request
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Get('me')
 * getMe(@CurrentUser() user: JwtPayload) { return user; }
 *
 * @Post()
 * create(@Body() dto, @CurrentUser('id') userId: number) { ... }
 * ```
 *
 * LỖI PHỔ BIẾN:
 * - Dùng @CurrentUser() mà không có JwtAuthGuard → request.user undefined
 * - Route có @Public() mà vẫn dùng @CurrentUser() → crash
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * createParamDecorator: Tạo decorator cho PARAMETER (không phải class/method)
 *
 * @param data - Tên field muốn lấy ('id', 'email', 'role')
 *              Nếu không truyền → trả về toàn bộ user object
 * @param ctx  - ExecutionContext: chứa request, response, handler info
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    /** switchToHttp() vì đang dùng HTTP (không phải WebSocket/gRPC) */
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    /** Nếu truyền field name → return field cụ thể, ngược lại return cả object */
    return data ? user?.[data] : user;
  },
);

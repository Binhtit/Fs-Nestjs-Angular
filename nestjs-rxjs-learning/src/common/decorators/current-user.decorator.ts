/**
 * KHÁI NIỆM: Custom Parameter Decorator
 *
 * TẠI SAO tạo @CurrentUser() thay vì dùng @Req() rồi req.user:
 * 1. Clean code: @CurrentUser() rõ ràng hơn @Req() → req.user
 * 2. Type-safe: Decorator trả về typed user object
 * 3. Decoupled: Controller không cần biết request structure
 * 4. Reusable: Dùng ở mọi controller, không lặp code
 * 5. Testable: Dễ mock hơn khi test controller
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Request đến → JwtAuthGuard chạy → gọi JwtStrategy.validate()
 * 2. validate() trả về user object → NestJS gắn vào request.user
 * 3. @CurrentUser() đọc request.user và trả về cho parameter
 *
 * LỖI PHỔ BIẾN:
 * - Quên apply JwtAuthGuard → request.user = undefined → crash
 * - Dùng @Req() khắp nơi → couple controller với Express request object
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Get('profile')
 * getProfile(@CurrentUser() user: UserEntity) {
 *   return user; // Đã có type, không cần cast
 * }
 *
 * // Lấy 1 field cụ thể:
 * @Get('my-id')
 * getMyId(@CurrentUser('id') userId: number) {
 *   return userId;
 * }
 * ```
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * createParamDecorator: Factory function của NestJS để tạo custom param decorator
 *
 * Parameters:
 * - data: giá trị truyền vào decorator, vd: @CurrentUser('id') → data = 'id'
 * - ctx: ExecutionContext chứa thông tin request (HTTP, WebSocket, gRPC, ...)
 *
 * ExecutionContext là abstraction layer:
 * - HTTP: ctx.switchToHttp().getRequest() → Express Request
 * - WebSocket: ctx.switchToWs().getClient() → Socket
 * - gRPC: ctx.switchToRpc().getData() → gRPC data
 * → Code decorator hoạt động across transport layers
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    /**
     * switchToHttp(): Chuyển context sang HTTP mode
     * getRequest(): Lấy Express Request object
     *
     * TẠI SAO không dùng ctx.getArgs()[0]:
     * - getArgs() trả về raw arguments, không type-safe
     * - switchToHttp() rõ ràng hơn, NestJS recommended
     */
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    /**
     * Nếu truyền field name (vd: @CurrentUser('id'))
     * → trả về field đó thay vì toàn bộ user object
     * Nếu không truyền → trả về full user
     */
    return data ? user?.[data] : user;
  },
);

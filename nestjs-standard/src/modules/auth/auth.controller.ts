/**
 * KHÁI NIỆM: Auth Controller — Điểm nhận HTTP requests cho authentication
 *
 * CONTROLLER TRONG MVC:
 * - Nhận request (HTTP method + URL + body/params)
 * - Gọi Service xử lý logic
 * - Trả response
 * - KHÔNG chứa business logic (chỉ delegate)
 *
 * SO SÁNH:
 * - DDD: Controller → CommandBus/QueryBus → Handler → Domain
 * - MVC: Controller → Service (TRỰC TIẾP) ← đơn giản hơn
 *
 * SWAGGER DECORATORS:
 * - @ApiTags('Auth'): Nhóm endpoints trong Swagger UI
 * - @ApiOperation(): Mô tả endpoint
 * - @ApiBody(): Mô tả request body
 *
 * TẠI SAO dùng @Public() thay vì @SetMetadata('isPublic', true) trực tiếp:
 * - @Public() là abstraction được định nghĩa trong public.decorator.ts
 * - Dùng constant IS_PUBLIC_KEY thay vì string hardcode 'isPublic'
 * - Nếu đổi tên key sau này → chỉ cần sửa 1 chỗ trong decorator
 * - Nhất quán, dễ đọc hơn, tránh typo
 */
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';

@ApiTags('Auth') // Nhóm trong Swagger
@Controller('auth') // Route prefix: /api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   *
   * @Public() → skip JWT guard (chưa có tài khoản → chưa có token)
   * @Body() dto → NestJS tự parse JSON body + validate bằng class-validator
   *
   * @Throttle(): Override global rate limit cho endpoint này
   * → 'default': 5 requests / 60 giây (thay vì 100/phút global)
   * → Chặt hơn để ngăn bot tạo hàng loạt tài khoản
   *
   * TẠI SAO auth endpoints cần limit chặt hơn:
   * - Brute force attack: thử hàng nghìn password/email
   * - Credential stuffing: dùng danh sách password bị rò rỉ
   * - Account enumeration: tạo hàng loạt account fake
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/v1/auth/login
   *
   * 5 lần thử / 60 giây → sau đó 429 Too Many Requests
   * Client phải đợi TTL reset mới thử lại
   */
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Đăng nhập' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/refresh
   * Gửi refreshToken → nhận accessToken mới
   *
   * Limit thoải hơn (20/phút) vì đây là normal user behavior
   * (access token hết hạn 15 phút → refresh 20 lần/phút là không thực tế)
   */
  @Public()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Làm mới access token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}

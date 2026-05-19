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
 */
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
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
   */
  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /api/v1/auth/login
   */
  @Public()
  @ApiOperation({ summary: 'Đăng nhập' })
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * POST /api/v1/auth/refresh
   * Gửi refreshToken → nhận accessToken mới
   */
  @Public()
  @ApiOperation({ summary: 'Làm mới access token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }
}

/**
 * Auth Controller
 * 3 endpoints: login, register, refresh
 * Login + Register là @Public() (không cần JWT)
 */
import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * @Public() → skip JwtAuthGuard
   * @UseGuards(AuthGuard('local')) → dùng LocalStrategy validate credentials
   */
  @Public()
  @UseGuards(AuthGuard('local'))
  @ApiOperation({ summary: 'Đăng nhập' })
  @Post('login')
  login(@Req() req: { user: { id: number; email: string; role: string } }, @Body() _dto: LoginDto) {
    /** req.user đã được LocalStrategy.validate() gắn vào */
    return this.authService.login(req.user);
  }

  @Public()
  @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @ApiOperation({ summary: 'Làm mới token' })
  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshTokens(refreshToken);
  }

  @ApiOperation({ summary: 'Đăng xuất' })
  @Post('logout')
  logout(@CurrentUser('id') userId: number) {
    return this.authService.logout(userId);
  }
}

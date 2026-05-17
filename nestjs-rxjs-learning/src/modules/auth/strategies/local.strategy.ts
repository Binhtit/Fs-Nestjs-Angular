/**
 * KHÁI NIỆM: Passport Local Strategy
 *
 * TẠI SAO dùng Passport:
 * - Authentication abstraction: Hỗ trợ nhiều strategy (local, jwt, google, facebook)
 * - Mature: 500+ strategies có sẵn
 * - NestJS integration: @nestjs/passport wrap Passport.js cho NestJS DI
 *
 * LOCAL STRATEGY:
 * - Authenticate bằng username/password
 * - Dùng cho endpoint POST /auth/login
 * - validate() return user nếu credentials đúng
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

/**
 * PassportStrategy(Strategy, 'local'):
 * - Strategy: passport-local strategy class
 * - 'local': Tên strategy, dùng với AuthGuard('local')
 */
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    /**
     * super() config passport-local:
     * - usernameField: 'email' → dùng email thay vì username (default)
     * - Passport tự extract email + password từ request body
     */
    super({ usernameField: 'email' });
  }

  /**
   * validate(): Passport gọi method này để xác thực credentials
   *
   * FLOW:
   * 1. Client gửi POST /auth/login { email, password }
   * 2. AuthGuard('local') trigger LocalStrategy
   * 3. Passport extract email, password từ body
   * 4. Gọi validate(email, password)
   * 5. Return user → gắn vào request.user
   * 6. Throw error → Passport return 401
   */
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    return user;
  }
}

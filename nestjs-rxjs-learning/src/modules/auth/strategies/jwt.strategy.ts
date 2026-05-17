/**
 * KHÁI NIỆM: JWT Strategy
 *
 * FLOW GIẢI MÃ JWT:
 * 1. Client gửi header: Authorization: Bearer <token>
 * 2. Strategy extract token từ header (ExtractJwt.fromAuthHeaderAsBearerToken)
 * 3. Passport VERIFY token: check signature + expiration
 *    - Verify ≠ Decode: Decode chỉ đọc, Verify check signature (an toàn)
 * 4. Nếu valid → gọi validate(payload) với decoded payload
 * 5. validate() return user object → gắn vào request.user
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

/**
 * JWT Payload interface
 * Đây là data được encode trong JWT token
 */
interface JwtPayload {
  sub: number;   // subject = user ID (JWT convention dùng 'sub')
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      /**
       * jwtFromRequest: Cách extract token từ request
       * fromAuthHeaderAsBearerToken(): Đọc header "Authorization: Bearer <token>"
       * Các option khác: fromBodyField(), fromQueryString(), fromCookie()
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * ignoreExpiration: false → Passport tự check token expired
       * Nếu expired → throw UnauthorizedException
       * KHÔNG BAO GIỜ set true trong production
       */
      ignoreExpiration: false,

      /** Secret key để verify signature */
      secretOrKey: configService.get<string>('jwt.secret', 'default-secret'),
    });
  }

  /**
   * validate(): Gọi SAU KHI token verified thành công
   * payload chứa data đã decode từ JWT
   *
   * TẠI SAO query DB ở đây:
   * - JWT payload có thể outdated (user bị xóa, role thay đổi)
   * - Query DB đảm bảo user vẫn tồn tại và lấy data mới nhất
   * - Trade-off: Mỗi request = 1 DB query (có thể cache nếu cần)
   */
  async validate(payload: JwtPayload) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User không tồn tại');
    }
    return user;
  }
}

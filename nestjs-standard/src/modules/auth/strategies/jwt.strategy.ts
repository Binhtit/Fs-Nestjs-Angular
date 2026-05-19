/**
 * KHÁI NIỆM: JWT Strategy — Passport xác thực JWT token
 *
 * PASSPORT là gì:
 * - Thư viện authentication phổ biến nhất cho Node.js
 * - Hỗ trợ 500+ strategies: JWT, Google, Facebook, GitHub...
 * - NestJS tích hợp qua @nestjs/passport
 *
 * JWT STRATEGY FLOW:
 * 1. Client gửi header: Authorization: Bearer eyJhbGciOi...
 * 2. Passport extract token từ header
 * 3. Verify token bằng secret key
 * 4. Nếu hợp lệ → gọi validate() → return user info
 * 5. NestJS gắn user info vào request.user
 *
 * validate() METHOD:
 * - Input: JWT payload đã decode (ví dụ: { sub: 1, email: 'admin@...' })
 * - Output: Object sẽ được gắn vào request.user
 * - KHÔNG CẦN verify token ở đây — Passport đã verify rồi
 * - Nơi để thêm logic: check user còn tồn tại không, có bị ban không...
 *
 * LỖI PHỔ BIẾN:
 * - JWT_SECRET khác nhau giữa sign và verify → "invalid signature"
 * - Token hết hạn → "jwt expired" (cần implement refresh token)
 * - Quên ExtractJwt.fromAuthHeaderAsBearerToken() → không extract được token
 */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT Payload: Dữ liệu nằm TRONG token
 * Được tạo khi sign token (trong AuthService.login)
 */
export interface JwtPayload {
  sub: number;    // user ID (convention: "sub" = subject)
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      /**
       * jwtFromRequest: Nơi lấy JWT token trong request
       * fromAuthHeaderAsBearerToken(): Lấy từ header "Authorization: Bearer xxx"
       *
       * Các option khác:
       * - fromUrlQueryParameter('token'): /api?token=xxx
       * - fromBodyField('token'): body { token: 'xxx' }
       * → Bearer header là CHUẨN RESTful
       */
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      /**
       * ignoreExpiration: false → tự động reject token hết hạn
       * Nếu true → token không bao giờ hết hạn → BẢO MẬT YẾU
       */
      ignoreExpiration: false,

      /**
       * secretOrKey: Khóa bí mật để verify token
       * PHẢI giống với secret dùng để SIGN token (trong AuthService)
       *
       * LƯU Ý: Production nên dùng env variable, không hardcode
       */
      secretOrKey: process.env.JWT_SECRET || 'blog-api-secret-key-change-in-production',
    });
  }

  /**
   * validate(): Chạy SAU KHI token đã verified thành công
   *
   * @param payload - JWT payload đã decode
   * @returns Object gắn vào request.user
   *
   * Ở đây chỉ map payload → user object đơn giản
   * Production: Nên query DB check user còn active không
   */
  validate(payload: JwtPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    /**
     * Object return → request.user
     * Ví dụ: request.user = { id: 1, email: 'admin@...', role: 'ADMIN' }
     */
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}

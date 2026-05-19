/**
 * KHÁI NIỆM: Auth Module — Đóng gói toàn bộ logic authentication
 *
 * MODULE trong NestJS:
 * - Là CONTAINER chứa: Controllers, Services, Providers liên quan
 * - Mỗi module = 1 feature/domain (auth, users, posts...)
 * - Module ĐÓNG GÓI → chỉ export những gì module khác cần
 *
 * AUTH MODULE CHỨA:
 * - AuthController: Nhận requests (/login, /register, /refresh)
 * - AuthService: Logic auth (hash password, sign JWT)
 * - JwtModule: Cấu hình JWT (secret, expiration)
 * - JwtStrategy: Passport strategy verify JWT token
 *
 * JwtModule.register():
 * - secret: Khóa bí mật → PHẢI giống với JwtStrategy
 * - signOptions.expiresIn: Thời gian hết hạn mặc định
 * - global: true → JwtService available ở mọi module
 */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    /**
     * PassportModule: Kích hoạt Passport authentication
     * defaultStrategy: 'jwt' → mặc định dùng JWT strategy
     */
    PassportModule.register({ defaultStrategy: 'jwt' }),

    /**
     * JwtModule: Cung cấp JwtService để sign/verify token
     *
     * global: true → JwtService inject được ở MỌI module
     * (không cần import JwtModule vào từng module)
     */
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'blog-api-secret-key-change-in-production',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // Passport strategy — PHẢI register ở đây
  ],
  exports: [AuthService], // Export để module khác dùng (nếu cần)
})
export class AuthModule {}

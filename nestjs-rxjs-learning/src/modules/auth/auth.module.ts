/**
 * Auth Module
 *
 * Import PassportModule + JwtModule + UsersModule
 * Register strategies (Local + JWT) as providers
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    /** Import UsersModule để dùng UsersService (exported) */
    UsersModule,
    PassportModule,
    /**
     * JwtModule.registerAsync: Config JWT dynamically
     * Dùng ConfigService để đọc secret từ env
     */
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret', 'default-secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.accessExpiration', '15m') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  /** Strategies PHẢI đăng ký trong providers để Passport tìm thấy */
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

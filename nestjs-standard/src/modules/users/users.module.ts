import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Users Module — Đóng gói logic quản lý User
 *
 * LƯU Ý: PrismaModule là @Global() → KHÔNG cần import ở đây
 * NestJS tự động inject PrismaService vào UsersService
 *
 * exports: [UsersService] → Cho phép module khác dùng UsersService
 * Ví dụ: AuthModule.register() cần check user tồn tại sau khi verify refresh token
 * Hoặc feature module khác cần lookup user theo email
 */
@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

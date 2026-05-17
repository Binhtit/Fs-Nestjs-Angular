/**
 * KHÁI NIỆM: Feature Module
 * Mỗi feature (users, tasks, auth) là 1 module độc lập
 * Module khai báo: controllers, providers (services), imports, exports
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  /**
   * TypeOrmModule.forFeature([UserEntity]):
   * Đăng ký entity cho module này → inject được Repository<UserEntity>
   */
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService],
  /**
   * exports: Cho phép module khác import và dùng UsersService
   * Ví dụ: AuthModule cần UsersService để tìm user khi login
   */
  exports: [UsersService],
})
export class UsersModule {}

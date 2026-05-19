/**
 * KHÁI NIỆM: App Module — Root Module của ứng dụng NestJS
 *
 * ROOT MODULE:
 * - Module GỐC — tất cả modules khác phải import vào đây
 * - NestJS bắt đầu từ AppModule → duyệt imports[] → khởi tạo tất cả
 *
 * THỨ TỰ IMPORTS (quan trọng):
 * 1. ConfigModule → đọc .env → phải đi đầu (modules khác cần env vars)
 * 2. PrismaModule → kết nối DB → phải trước feature modules
 * 3. AuthModule → setup JWT strategy → phải trước modules cần auth
 * 4. Feature modules → thứ tự không quan trọng
 *
 * APP_GUARD: Global Guard áp dụng cho TẤT CẢ routes
 * - JwtAuthGuard → mọi route yêu cầu JWT token
 * - Trừ routes có @Public() decorator
 *
 * APP_INTERCEPTOR: Global Interceptor
 * - LoggingInterceptor → ghi log mọi request
 * - TransformInterceptor → wrap response thành format chuẩn
 *
 * APP_FILTER: Global Exception Filter
 * - AllExceptionsFilter → bắt mọi lỗi → trả JSON chuẩn
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';

/** Infrastructure */
import { PrismaModule } from './prisma/prisma.module';

/** Common (cross-cutting concerns) */
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

/** Feature Modules */
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [
    /**
     * ConfigModule: Đọc file .env → inject qua ConfigService
     * isGlobal: true → ConfigService available ở mọi module
     * envFilePath: '.env' → file chứa environment variables
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    /** Database connection (global) */
    PrismaModule,

    /** Feature modules */
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
  ],
  providers: [
    /**
     * APP_GUARD: JwtAuthGuard áp dụng GLOBAL
     * → Mọi route yêu cầu JWT token
     * → Routes có @Public() → skip kiểm tra
     */
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    /**
     * APP_INTERCEPTOR: Global interceptors (chạy theo thứ tự đăng ký)
     * 1. LoggingInterceptor → ghi log request/response
     * 2. TransformInterceptor → wrap response format chuẩn
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },

    /**
     * APP_FILTER: Global exception filter
     * Bắt TẤT CẢ exceptions → trả JSON format chuẩn
     */
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}

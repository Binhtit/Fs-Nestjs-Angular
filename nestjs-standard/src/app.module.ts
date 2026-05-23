/**
 * KHÁI NIỆM: App Module — Root Module của ứng dụng NestJS
 *
 * ROOT MODULE:
 * - Module GỐC — tất cả modules khác phải import vào đây
 * - NestJS bắt đầu từ AppModule → duyệt imports[] → khởi tạo tất cả
 *
 * THỨ TỰ IMPORTS (quan trọng):
 * 1. ConfigModule → đọc .env → phải đi đầu (modules khác cần env vars)
 * 2. ThrottlerModule → rate limiting global
 * 3. CacheModule → in-memory cache
 * 4. ScheduleModule → kích hoạt cron scheduler
 * 5. PrismaModule → kết nối DB → phải trước feature modules
 * 6. AuthModule → setup JWT strategy → phải trước modules cần auth
 * 7. Feature modules → thứ tự không quan trọng
 *
 * APP_GUARD: Global Guard áp dụng cho TẤT CẢ routes (theo thứ tự đăng ký)
 * 1. ThrottlerGuard → kiểm tra rate limit trước
 * 2. JwtAuthGuard → kiểm tra JWT token
 *
 * APP_INTERCEPTOR: Global Interceptor
 * - ClassSerializerInterceptor → serialize response (áp dụng @Exclude)
 * - LoggingInterceptor → ghi log mọi request
 * - TransformInterceptor → wrap response thành format chuẩn
 *
 * APP_FILTER: Global Exception Filter
 * - AllExceptionsFilter → bắt mọi lỗi → trả JSON chuẩn
 *
 * NestModule: Interface cho phép configure Middleware
 * - Middleware chạy TRƯỚC guards và interceptors
 * - Dùng MiddlewareConsumer để áp dụng cho specific routes
 */
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ClassSerializerInterceptor } from '@nestjs/common';

/** Config */
import { envValidationSchema } from './config/env.validation';

/** Infrastructure */
import { PrismaModule } from './prisma/prisma.module';

/** Common (cross-cutting concerns) */
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';

/** Feature Modules */
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HealthModule } from './modules/health/health.module';
import { SchedulerModule } from './modules/scheduler/scheduler.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    /**
     * ConfigModule: Đọc file .env → inject qua ConfigService
     * isGlobal: true → ConfigService available ở mọi module
     *
     * validationSchema: Joi schema kiểm tra env vars tại STARTUP
     * → App REFUSE to start nếu thiếu JWT_SECRET, JWT_REFRESH_SECRET
     * → "Fail fast" principle: lỗi config phải lộ sớm nhất có thể
     *
     * validationOptions.abortEarly: false → báo TẤT CẢ lỗi validation
     * (mặc định: true → báo lỗi đầu tiên rồi dừng)
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      validationOptions: { abortEarly: false },
    }),

    /**
     * ThrottlerModule: Rate limiting global
     *
     * Cấu hình mảng vì hỗ trợ nhiều tier throttling khác nhau:
     * - 'short': 10 requests trong 1 giây (chống burst)
     * - 'default': 100 requests trong 1 phút (global limit)
     *
     * Override tại route level bằng @Throttle({ default: { limit: 5, ttl: 60000 } })
     */
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 giây
        limit: 10,   // 10 requests/giây
      },
      {
        name: 'default',
        ttl: 60000,  // 1 phút
        limit: 100,  // 100 requests/phút
      },
    ]),

    /**
     * CacheModule: In-memory caching
     *
     * ttl: Thời gian cache mặc định (milliseconds) — 60 giây
     * max: Số items tối đa trong cache — tránh memory leak
     *
     * isGlobal: true → CacheInterceptor available ở mọi module
     * mà không cần import CacheModule vào từng module
     *
     * Production: Thay bằng Redis adapter:
     * import { redisStore } from 'cache-manager-redis-store';
     * store: redisStore, host: 'localhost', port: 6379
     */
    CacheModule.register({
      isGlobal: true,
      ttl: 60000, // 60 giây
      max: 100,   // Tối đa 100 cached items
    }),

    /**
     * ScheduleModule: Kích hoạt cron job scheduler
     * forRoot(): Khởi tạo scheduler engine (node-cron)
     * → Sau khi có module này, @Cron/@Interval/@Timeout mới hoạt động
     */
    ScheduleModule.forRoot(),

    /** Database connection (global) */
    PrismaModule,

    /** Feature modules */
    AuthModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    CommentsModule,
    HealthModule,
    SchedulerModule,
    UploadModule,
  ],
  providers: [
    /**
     * APP_GUARD: Guards áp dụng GLOBAL (theo thứ tự đăng ký)
     *
     * 1. ThrottlerGuard: Kiểm tra rate limit TRƯỚC
     *    → Reject request vượt limit ngay lập tức (429 Too Many Requests)
     *    → Tiết kiệm tài nguyên: không cần verify JWT nếu đã rate limited
     *
     * 2. JwtAuthGuard: Kiểm tra JWT token
     *    → Chỉ chạy nếu ThrottlerGuard pass
     *    → Routes có @Public() → skip kiểm tra
     */
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    /**
     * APP_INTERCEPTOR: Global interceptors (chạy theo thứ tự đăng ký)
     *
     * 1. ClassSerializerInterceptor: Serialize response objects
     *    → Tự động apply @Exclude() trên Entity classes
     *    → PHẢI đặt TRƯỚC TransformInterceptor
     *    → Cần reflector: inject Reflector để đọc @SerializeOptions metadata
     *
     * 2. LoggingInterceptor: Ghi log request/response timing
     *
     * 3. TransformInterceptor: Wrap response → format chuẩn
     *    → Phải CUỐI CÙNG để wrap đúng data đã serialize
     */
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
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

/**
 * NestModule: Interface yêu cầu implement configure()
 * → Dùng để đăng ký Middleware theo route pattern
 *
 * Middleware vs Guard vs Interceptor:
 * - Middleware: Chạy trước cả guard, không có ExecutionContext
 * - Guard: Quyết định vào hay không (có ExecutionContext)
 * - Interceptor: Bọc handler (có thể sửa response)
 */
export class AppModule implements NestModule {
  /**
   * configure(): Đăng ký middleware với MiddlewareConsumer
   *
   * consumer.apply(Middleware1, Middleware2): Middleware cần áp dụng
   * .exclude(...routes): Bỏ qua các routes này
   * .forRoutes('*'): Áp dụng tất cả còn lại
   *
   * forRoutes có thể nhận:
   * - String: 'users', '*', 'posts'
   * - Object: { path: 'users', method: RequestMethod.GET }
   * - Controller class: UsersController
   */
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestLoggerMiddleware)
      .exclude(
        'health',         // Không log health check (quá nhiều noise)
        'api-docs',       // Không log Swagger
        'api-docs/(.*)',  // Swagger sub-paths
        'uploads/(.*)',   // Static files
      )
      .forRoutes('*'); // Áp dụng tất cả routes còn lại
  }
}

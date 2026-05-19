/**
 * ROOT MODULE - Trung tâm kết nối toàn bộ ứng dụng
 *
 * NGUYÊN TẮC:
 * - Import TẤT CẢ feature modules ở đây
 * - Đăng ký global providers (guards, interceptors, filters, pipes)
 * - ConfigModule.forRoot() phải ở đây (isGlobal: true)
 */
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Config
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';

// Common
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { BusinessExceptionFilter } from './common/filters/business-exception.filter';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { createValidationPipe } from './common/pipes/validation.pipe';

// Database
import { DatabaseModule } from './database/database.module';
import { SeedService } from './database/seeds/seed.service';

// Feature Modules
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { RealtimeModule } from './modules/realtime/realtime.module';
import { RxjsExamplesModule } from './modules/rxjs-examples/rxjs-examples.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { UsersModule } from './modules/users/users.module';
import { MessagingModule } from './modules/messaging/messaging.module';

// Shared
import { AppCacheModule } from './shared/cache/cache.module';

// Entities (for seed service)
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './modules/users/entities/user.entity';

@Module({
  imports: [
    /**
     * ConfigModule.forRoot():
     * - isGlobal: true → ConfigService available ở MỌI module
     * - load: Nạp config files (app, database, jwt)
     * - envFilePath: Đường dẫn file .env
     */
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig],
      envFilePath: '.env',
    }),

    /** Rate Limiting */
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 100 }],
    }),

    /** Database */
    DatabaseModule,
    TypeOrmModule.forFeature([UserEntity]),

    /** Feature Modules */
    AuthModule,
    UsersModule,
    TasksModule,
    RxjsExamplesModule,
    RealtimeModule,
    HealthModule,
    MessagingModule,

    /** Shared */
    AppCacheModule,
  ],
  providers: [
    /** Seed Service */
    SeedService,

    /**
     * GLOBAL PROVIDERS - Áp dụng cho TẤT CẢ routes
     *
     * THỨ TỰ THỰC THI:
     * Middleware → Guards → Interceptors (before) → Pipes → Handler → Interceptors (after) → Filters
     */

    // Guards (thứ tự: JWT trước, Roles sau, Throttler)
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },

    // Interceptors
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
    { provide: APP_INTERCEPTOR, useValue: new TimeoutInterceptor() },

    // Filters (specific filter trước, catch-all sau)
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: BusinessExceptionFilter },

    // Pipes
    { provide: APP_PIPE, useValue: createValidationPipe() },
  ],
})
export class AppModule implements NestModule {
  /**
   * NestModule: Interface cho phép configure middleware
   * Middleware chạy TRƯỚC mọi thứ khác
   */
  configure(consumer: MiddlewareConsumer): void {
    // eslint-disable-next-line prettier/prettier
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*'); // Apply cho tất cả routes
  }
}

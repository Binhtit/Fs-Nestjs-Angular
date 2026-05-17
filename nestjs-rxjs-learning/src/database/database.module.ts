/**
 * KHÁI NIỆM: Database Module
 *
 * TẠI SAO tách Database thành module riêng:
 * 1. Separation of Concerns: Config DB tách khỏi business modules
 * 2. Reusable: Import DatabaseModule 1 lần ở AppModule → tất cả modules dùng được
 * 3. Testable: Mock DatabaseModule cho testing → không cần real DB
 *
 * PATTERN: forRootAsync + useFactory
 * - forRoot: Config tĩnh (hardcode values)
 * - forRootAsync: Config động (đọc từ env, inject services)
 * → Luôn dùng forRootAsync trong dự án thật
 *
 * forRoot vs forFeature:
 * - forRoot(): Đăng ký ở ROOT module (AppModule), chỉ gọi 1 LẦN
 *   → Tạo database connection
 * - forFeature(): Đăng ký ở FEATURE module, gọi NHIỀU lần
 *   → Đăng ký entity nào module đó dùng
 *
 * Ví dụ:
 * - AppModule: TypeOrmModule.forRoot(config) → tạo connection
 * - UsersModule: TypeOrmModule.forFeature([UserEntity]) → dùng UserEntity
 * - TasksModule: TypeOrmModule.forFeature([TaskEntity]) → dùng TaskEntity
 */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      /**
       * inject: [ConfigService] → NestJS inject ConfigService vào useFactory
       *
       * TẠI SAO cần inject:
       * - useFactory là plain function, không có DI tự động
       * - Phải declare dependency trong inject array
       * - NestJS resolve dependency → truyền vào factory function
       */
      inject: [ConfigService],

      /**
       * useFactory: Async function trả về TypeORM config
       *
       * TẠI SAO async:
       * - ConfigService load .env file async
       * - Có thể fetch config từ external source (AWS Secrets Manager, Vault)
       * - Đảm bảo config sẵn sàng trước khi tạo connection
       */
      useFactory: (configService: ConfigService) => ({
        /**
         * type: Database driver
         * 'better-sqlite3' → SQLite (dev, zero setup)
         * 'mysql' → MySQL (production)
         *
         * TypeORM abstract SQL dialect → code không đổi khi switch DB
         */
        type: configService.get<string>('database.type') as 'better-sqlite3' | 'mysql',

        /**
         * Connection settings (chỉ dùng cho MySQL/PostgreSQL)
         * SQLite bỏ qua host/port/username/password
         */
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),

        /**
         * Database name hoặc file path (SQLite)
         */
        database: configService.get<string>('database.database'),

        /**
         * autoLoadEntities: true
         *
         * TẠI SAO: Tự động load entities đăng ký qua forFeature()
         * Thay vì list thủ công: entities: [UserEntity, TaskEntity, ...]
         * → Thêm entity mới chỉ cần forFeature(), không sửa forRoot()
         *
         * LỖI PHỔ BIẾN: autoLoadEntities: false + quên list entity
         * → TypeORM không biết entity → table không được tạo → runtime error
         */
        autoLoadEntities: true,

        /**
         * ⚠️ synchronize: CHỈ DÙNG CHO DEVELOPMENT
         * Xem comment chi tiết ở database.config.ts
         */
        synchronize: configService.get<boolean>('database.synchronize'),

        /**
         * logging: Log SQL queries
         * Dev: true → xem query để debug/optimize
         * Production: false → tránh log sensitive data
         */
        logging: configService.get<string>('app.env') === 'development',
      }),
    }),
  ],
})
export class DatabaseModule {}

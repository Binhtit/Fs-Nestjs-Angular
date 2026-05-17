/**
 * KHÁI NIỆM: Database Agnostic Configuration
 *
 * TẠI SAO thiết kế database-agnostic:
 * 1. Development: Dùng SQLite → không cần cài MySQL, Docker, zero setup
 * 2. Production: Chuyển sang MySQL/PostgreSQL chỉ bằng đổi .env
 * 3. Testing: Dùng SQLite in-memory cho test nhanh
 * 4. TypeORM abstract hóa SQL dialect → code không đổi khi switch DB
 *
 * LỖI PHỔ BIẾN:
 * - synchronize: true trong production → TypeORM tự ALTER TABLE
 *   → MẤT DATA khi entity thay đổi! Chỉ dùng trong development
 * - Hardcode connection string → lộ credentials trong source code
 * - Không dùng forRootAsync → config load trước khi env vars sẵn sàng
 *
 * PATTERN: forRootAsync + useFactory + inject ConfigService
 * Đây là pattern chuẩn NestJS để async configuration:
 * - useFactory: function trả về config object
 * - inject: [ConfigService] → NestJS inject ConfigService vào factory
 * - Đảm bảo ConfigModule load xong → mới khởi tạo TypeORM
 */
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  /**
   * Loại database driver
   * 'better-sqlite3' cho development (zero setup, file-based)
   * 'mysql' cho production (cần MySQL server)
   */
  type: process.env.DB_TYPE ?? 'better-sqlite3',

  /**
   * Host database server (chỉ cần cho MySQL/PostgreSQL)
   * SQLite không cần vì là file-based
   */
  host: process.env.DB_HOST ?? 'localhost',

  /**
   * Port database (MySQL default: 3306, PostgreSQL: 5432)
   */
  port: parseInt(process.env.DB_PORT ?? '3306', 10),

  /**
   * Credentials (chỉ cần cho MySQL/PostgreSQL)
   */
  username: process.env.DB_USERNAME ?? 'root',
  password: process.env.DB_PASSWORD ?? '',

  /**
   * Tên database hoặc đường dẫn file SQLite
   * SQLite: 'database.sqlite' → tạo file trong thư mục gốc project
   * MySQL: tên database trên server
   */
  database: process.env.DB_DATABASE ?? 'database.sqlite',

  /**
   * ⚠️ CẢNH BÁO: synchronize chỉ dùng cho DEVELOPMENT
   *
   * Khi true: TypeORM tự động tạo/sửa bảng theo entity definition
   * → Tiện cho dev nhưng NGUY HIỂM cho production
   * → Production PHẢI dùng migration thay thế
   *
   * Ví dụ nguy hiểm:
   * - Bạn xóa 1 column trong entity → TypeORM DROP column → MẤT DATA
   * - Bạn rename column → TypeORM DROP cũ + CREATE mới → MẤT DATA
   */
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
}));

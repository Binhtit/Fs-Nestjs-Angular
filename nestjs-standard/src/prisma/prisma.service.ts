/**
 * KHÁI NIỆM: Prisma Service — Quản lý kết nối Database
 *
 * TẠI SAO cần PrismaService (không dùng PrismaClient trực tiếp):
 * 1. LIFECYCLE HOOKS: NestJS cần biết khi nào connect/disconnect
 * 2. SINGLETON: Đảm bảo chỉ có 1 connection pool trong toàn app
 * 3. TESTABLE: Dễ mock khi unit test
 * 4. SHUTDOWN HOOKS: Đóng connection khi app tắt
 *
 * PRISMA v7 BREAKING CHANGE:
 * - v5: PrismaClient() tự kết nối → không cần adapter
 * - v7: PrismaClient() BẮT BUỘC truyền adapter hoặc accelerateUrl
 *   → Cần install @prisma/adapter-better-sqlite3 cho SQLite
 *   → Adapter là "cầu nối" giữa Prisma Client và database driver
 *
 * SOFT DELETE — CÁCH TRIỂN KHAI TRONG PRISMA v7:
 * - Prisma v5 có $use() middleware → intercept queries (auto soft delete)
 * - Prisma v7 đã BỎ $use() → dùng $extends() (extensions) hoặc service-level
 *
 * DỰ ÁN NÀY: Service-level soft delete (explicit hơn, dễ hiểu hơn cho học):
 * - remove() gọi update({ data: { deletedAt: new Date() } }) thay vì delete()
 * - findMany/findUnique thêm where: { deletedAt: null } thủ công
 *
 * SO SÁNH 3 CÁCH SOFT DELETE TRONG PRISMA:
 * ┌─────────────────────┬──────────────────────┬────────────────────────────┐
 * │ Cách                │ Ưu điểm              │ Nhược điểm                 │
 * ├─────────────────────┼──────────────────────┼────────────────────────────┤
 * │ $use() middleware   │ Transparent, 1 chỗ   │ Deprecated v5, bỏ v7       │
 * │ (đã bỏ)            │                      │                            │
 * ├─────────────────────┼──────────────────────┼────────────────────────────┤
 * │ $extends()          │ Supported v5+        │ Phức tạp hơn, type gymnastics│
 * │ (recommended)       │ Type-safe            │                            │
 * ├─────────────────────┼──────────────────────┼────────────────────────────┤
 * │ Service-level       │ Đơn giản, rõ ràng    │ Phải nhớ filter ở mỗi query│
 * │ (dùng ở đây)        │ Dễ hiểu, dễ debug    │ Có thể quên filter         │
 * └─────────────────────┴──────────────────────┴────────────────────────────┘
 *
 * CÁCH DÙNG:
 * - Inject PrismaService vào bất kỳ service nào cần query DB
 * - this.prisma.user.findMany() → lấy danh sách users
 * - this.prisma.post.create({ data: {...} }) → tạo post mới
 *
 * LỖI PHỔ BIẾN:
 * - Quên onModuleInit() → connection chưa mở khi service bắt đầu dùng
 * - Quên onModuleDestroy() → connection leak khi hot reload
 * - Prisma v7: quên truyền adapter → lỗi "requires adapter or accelerateUrl"
 */
import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  /**
   * Constructor: Prisma v7 BẮT BUỘC truyền adapter
   *
   * PrismaBetterSqlite3: Adapter cho SQLite (dùng better-sqlite3 driver)
   * - url: Đường dẫn file DB (tương đối từ thư mục project)
   *        Format: 'file:./prisma/dev.db' (relative) hoặc 'file:/absolute/path/dev.db'
   * - Nếu đổi sang PostgreSQL: dùng @prisma/adapter-pg thay thế
   *
   * FLOW: PrismaClient → Adapter → Driver → Database
   * (Prisma Client không còn dùng Rust engine nữa → nhẹ hơn)
   */
  constructor() {
    const adapter = new PrismaBetterSqlite3({
      url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    });

    super({ adapter });
  }

  /**
   * onModuleInit(): NestJS lifecycle hook
   * Chạy sau khi module khởi tạo xong → mở kết nối DB
   */
  async onModuleInit() {
    await this.$connect();
    this.logger.log('✅ Prisma đã kết nối database (SQLite via adapter)');
  }

  /**
   * onModuleDestroy(): Lifecycle hook khi app shutdown
   * Đóng kết nối DB → giải phóng resources
   */
  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('🔌 Prisma đã ngắt kết nối database');
  }
}

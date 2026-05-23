/**
 * KHÁI NIỆM: Scheduled Tasks — Tác vụ chạy theo lịch (Cron Jobs)
 *
 * SCHEDULED TASKS là gì:
 * - Tác vụ chạy TỰ ĐỘNG theo lịch, không cần user trigger
 * - Ví dụ: xóa file tạm mỗi đêm, gửi email digest hàng tuần, backup DB...
 * - Khác HTTP handler: không có request/response, không có user context
 *
 * @nestjs/schedule cung cấp 3 loại decorator:
 *
 * 1. @Cron(expression): Chạy theo lịch cố định
 *    Cron expression: "giây phút giờ ngày tháng thứ"
 *    VD: '0 0 * * *'    → 00:00 mỗi ngày
 *        '0 * /6 * * *' → mỗi 6 giờ (dấu cách trong * /6 chỉ để tránh lỗi JSDoc)
 *        '0 9 * * 1'    → 9 giờ sáng mỗi thứ 2
 *
 * 2. @Interval(ms): Chạy lặp lại sau mỗi N milliseconds
 *    VD: @Interval(60000) → mỗi 60 giây
 *    Khác @Cron: không dừng lại dù job trước chưa xong
 *
 * 3. @Timeout(ms): Chạy 1 LẦN DUY NHẤT sau N ms kể từ khi app start
 *    VD: @Timeout(5000) → 5 giây sau khi app start → chạy 1 lần → dừng
 *
 * TẠI SAO scheduler phải là Service riêng (không đặt trong feature service):
 * - Single Responsibility: Scheduler chỉ biết "khi nào" chạy
 * - Scheduler inject feature service để thực hiện logic
 * - Dễ disable/enable cron khi test (mock SchedulerService)
 * - Tách biệt concern: business logic ≠ scheduling logic
 *
 * CÁCH DISABLE TRONG TEST:
 * - Override ScheduleModule: ScheduleModule không import vào test module
 * - Hoặc mock các method cron với jest.spyOn()
 */
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, Timeout } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * TASK 1: Auto-archive bài DRAFT quá 30 ngày
   *
   * @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT):
   * → Tương đương '0 0 * * *' — chạy lúc 00:00 mỗi ngày
   *
   * CronExpression: Enum chứa các cron preset phổ biến
   * - EVERY_MINUTE: '* * * * *'
   * - EVERY_HOUR: '0 * * * *'
   * - EVERY_DAY_AT_MIDNIGHT: '0 0 * * *'
   * - EVERY_WEEK: '0 0 * * 0'
   * - EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT: '0 0 1 * *'
   *
   * Dùng preset thay vì viết cron string thủ công:
   * → Dễ đọc, ít typo, IDE có autocomplete
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'archive-old-drafts', // Tên task — dùng để manage (enable/disable)
    timeZone: 'Asia/Ho_Chi_Minh', // Timezone cụ thể
  })
  async archiveOldDrafts(): Promise<void> {
    this.logger.log('[Cron] Bắt đầu archive bài DRAFT cũ...');

    /**
     * Tìm bài DRAFT không được sửa trong 30 ngày
     *
     * lt: less than (nhỏ hơn)
     * thirtyDaysAgo: ngày hiện tại - 30 ngày
     */
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.prisma.post.updateMany({
      where: {
        status: 'DRAFT',
        updatedAt: { lt: thirtyDaysAgo },
      },
      data: { status: 'ARCHIVED' },
    });

    this.logger.log(`[Cron] Đã archive ${result.count} bài DRAFT cũ`);
  }

  /**
   * TASK 2: Log thống kê mỗi 5 phút
   *
   * @Interval(ms): Chạy lặp lại sau mỗi N milliseconds
   * → 300000ms = 5 phút
   *
   * Khác @Cron:
   * - @Cron: Chạy đúng lúc cố định trong ngày (clock-based)
   * - @Interval: Chạy sau N ms kể từ lần chạy TRƯỚC (relative)
   * → @Cron phù hợp hơn cho tasks cần đúng giờ
   * → @Interval phù hợp hơn cho tasks polling/monitoring
   */
  @Interval(300000) // 5 phút
  async logStats(): Promise<void> {
    const [postCount, userCount] = await Promise.all([
      this.prisma.post.count({ where: { status: 'PUBLISHED' } }),
      this.prisma.user.count(),
    ]);

    this.logger.log(
      `[Stats] Published posts: ${postCount} | Total users: ${userCount}`,
    );
  }

  /**
   * TASK 3: Startup task — chạy 1 lần duy nhất khi app start
   *
   * @Timeout(ms): Chạy sau N ms kể từ khi app start, KHÔNG lặp lại
   * → Dùng cho: warm-up cache, check data integrity, send startup notification
   *
   * Đặt timeout 5s để chờ DB connection ổn định trước khi chạy
   */
  @Timeout(5000)
  async runOnStartup(): Promise<void> {
    const publishedCount = await this.prisma.post.count({
      where: { status: 'PUBLISHED' },
    });

    this.logger.log(
      `[Startup] App đã sẵn sàng! Có ${publishedCount} bài viết đã publish.`,
    );
  }
}

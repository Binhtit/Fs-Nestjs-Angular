/**
 * Scheduler Module — Đóng gói tất cả scheduled tasks
 *
 * LƯU Ý: ScheduleModule.forRoot() phải được import trong AppModule
 * (không import ở đây) để kích hoạt scheduler globally
 *
 * PrismaModule là @Global() → PrismaService inject được vào SchedulerService
 */
import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';

@Module({
  providers: [SchedulerService],
})
export class SchedulerModule {}

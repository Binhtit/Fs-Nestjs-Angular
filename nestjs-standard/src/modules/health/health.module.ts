/**
 * Health Module — Đóng gói health check functionality
 *
 * TerminusModule: Cung cấp HealthCheckService + built-in indicators
 * PrismaHealthIndicator: Custom indicator cần inject PrismaService
 *
 * PrismaModule là @Global() → PrismaService tự inject được
 * → Không cần import PrismaModule ở đây
 */
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma-health.indicator';

@Module({
  imports: [
    /**
     * TerminusModule: Enable health check infrastructure
     * Cung cấp: HealthCheckService, MemoryHealthIndicator, DiskHealthIndicator, HttpHealthIndicator
     */
    TerminusModule,
  ],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator],
})
export class HealthModule {}

/**
 * KHÁI NIỆM: Health Check — Kiểm tra trạng thái ứng dụng
 *
 * HEALTH CHECK là gì:
 * - Endpoint GET /health → trả về trạng thái của app và các dependencies
 * - DevOps/Monitoring tools gọi định kỳ để biết app còn "sống" không
 * - Docker, Kubernetes dùng để quyết định có restart container không
 *
 * 2 LOẠI PROBE TRONG KUBERNETES:
 * ┌──────────────────┬─────────────────────────────────────────────┐
 * │ Probe            │ Ý nghĩa                                     │
 * ├──────────────────┼─────────────────────────────────────────────┤
 * │ Liveness Probe   │ App còn chạy không? (không → restart)       │
 * │ Readiness Probe  │ App sẵn sàng nhận traffic? (không → remove  │
 * │                  │ khỏi load balancer)                         │
 * └──────────────────┴─────────────────────────────────────────────┘
 * → Cả hai đều gọi /health để check
 *
 * RESPONSE FORMAT:
 * {
 *   status: 'ok' | 'error',
 *   info: { database: { status: 'up' }, memory: { status: 'up' } },
 *   error: {},
 *   details: { ... chi tiết từng indicator ... }
 * }
 *
 * CÁC LOẠI INDICATOR (@nestjs/terminus cung cấp):
 * - HttpHealthIndicator: gọi HTTP endpoint ngoài → check external API
 * - MemoryHealthIndicator: kiểm tra RAM usage
 * - DiskHealthIndicator: kiểm tra disk usage
 * - Custom indicator: tự viết (ví dụ: PrismaHealthIndicator bên dưới)
 *
 * LƯU Ý: Route /health phải là @Public() — không cần JWT token
 * (monitoring tools không có token, cần truy cập được lúc app chưa có user)
 */
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PrismaHealthIndicator } from './prisma-health.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    /**
     * HealthCheckService: Orchestrate các health indicators
     * Chạy tất cả → tổng hợp kết quả → trả response chuẩn
     */
    private health: HealthCheckService,

    /** PrismaHealthIndicator: Custom indicator tự viết */
    private prismaIndicator: PrismaHealthIndicator,

    /** MemoryHealthIndicator: Built-in — check RAM usage */
    private memory: MemoryHealthIndicator,

    /** DiskHealthIndicator: Built-in — check disk space */
    private disk: DiskHealthIndicator,
  ) {}

  /**
   * GET /api/v1/health
   *
   * @Public() → monitoring tools không có JWT token
   * @HealthCheck() → decorator của terminus, enable health check logic
   *
   * RESPONSE khi healthy (200 OK):
   * {
   *   "status": "ok",
   *   "info": {
   *     "database": { "status": "up" },
   *     "memory_heap": { "status": "up" },
   *     "storage": { "status": "up" }
   *   }
   * }
   *
   * RESPONSE khi có vấn đề (503 Service Unavailable):
   * {
   *   "status": "error",
   *   "error": {
   *     "database": { "status": "down", "message": "Connection failed" }
   *   }
   * }
   */
  @Public()
  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Kiểm tra trạng thái ứng dụng',
    description: 'Trả về trạng thái database, memory, disk. Không cần JWT token.',
  })
  check() {
    return this.health.check([
      /**
       * Indicator 1: Database connectivity
       * PrismaHealthIndicator.isHealthy() → thực hiện query đơn giản
       * → Nếu DB down → indicator này fail → response status: 'error'
       */
      () => this.prismaIndicator.isHealthy('database'),

      /**
       * Indicator 2: Memory heap usage
       * Threshold: 300MB — nếu heap vượt quá → cảnh báo memory leak
       *
       * checkHeap: Kiểm tra V8 heap (JavaScript memory)
       * checkRSS: Kiểm tra Resident Set Size (tổng process memory)
       */
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB

      /**
       * Indicator 3: Disk storage
       * thresholdPercent: 0.9 → cảnh báo khi disk > 90%
       * path: '/' → check root disk (thay bằng path thực tế nếu cần)
       */
      () =>
        this.disk.checkStorage('storage', {
          thresholdPercent: 0.9,
          path: '/',
        }),
    ]);
  }
}

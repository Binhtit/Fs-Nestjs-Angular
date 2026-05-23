/**
 * KHÁI NIỆM: Custom Health Indicator
 *
 * @nestjs/terminus cung cấp HealthIndicator base class
 * → Kế thừa để tạo indicator riêng cho bất kỳ dependency nào
 *
 * CÁCH VIẾT CUSTOM INDICATOR:
 * 1. extends HealthIndicator
 * 2. isHealthy(key): Thực hiện check
 * 3. Dùng this.getStatus(key, isHealthy, details?) để tạo result object
 * 4. Nếu unhealthy → throw HealthCheckError
 *
 * PRISMA INDICATOR:
 * - Chạy query đơn giản ($queryRaw`SELECT 1`) để test connection
 * - Nếu Prisma connected → SELECT 1 thành công → healthy
 * - Nếu DB down → query fail → throw HealthCheckError → status: 'error'
 */
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  /**
   * isHealthy(): Kiểm tra Prisma/Database còn kết nối không
   *
   * @param key - Tên hiển thị trong health check response (ví dụ: 'database')
   * @returns HealthIndicatorResult — object mô tả trạng thái
   * @throws HealthCheckError nếu DB không available
   */
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      /**
       * $queryRaw`SELECT 1`: Query tối giản nhất để test connection
       * - Không đọc/ghi data thực
       * - Nhanh (< 1ms nếu connected)
       * - Hoạt động trên mọi loại DB (SQLite, PostgreSQL, MySQL...)
       */
      await this.prisma.$queryRaw`SELECT 1`;

      /**
       * getStatus(key, isHealthy, details?):
       * → Trả về { [key]: { status: 'up' } } nếu isHealthy = true
       * → Trả về { [key]: { status: 'down', ...details } } nếu false
       */
      return this.getStatus(key, true);
    } catch (error) {
      /**
       * DB unreachable → throw HealthCheckError
       *
       * HealthCheckError(message, causes):
       * - message: Mô tả lỗi tổng quan
       * - causes: Chi tiết từng indicator fail (dùng getStatus với false)
       */
      throw new HealthCheckError(
        'Prisma health check failed',
        this.getStatus(key, false, {
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
      );
    }
  }
}

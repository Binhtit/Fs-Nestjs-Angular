/**
 * KHÁI NIỆM: Cache Module — In-Memory (fallback khi không có Redis)
 *
 * CACHE STRATEGIES:
 * 1. Cache-Aside (Lazy Loading): App check cache → miss → query DB → set cache
 * 2. Write-Through: App write DB + cache cùng lúc
 * 3. Write-Behind: App write cache → async flush to DB
 *
 * PATTERN TRONG DỰ ÁN NÀY:
 * - Cache-Aside cho Query Handlers (read)
 * - Event-driven invalidation cho Command Handlers (write)
 *
 * KHI CÓ REDIS: Đổi store sang cache-manager-redis-yet
 * ```
 * npm install cache-manager-redis-yet
 * CacheModule.registerAsync({
 *   useFactory: () => ({
 *     store: redisStore,
 *     socket: { host: 'localhost', port: 6379 },
 *     ttl: 60000,
 *   }),
 * })
 * ```
 */
import { Module, Global } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    NestCacheModule.register({
      /** TTL mặc định: 60 giây */
      ttl: 60000,
      /** Số lượng items tối đa trong cache */
      max: 100,
      /**
       * Không truyền store → dùng in-memory (default)
       * Production: chuyển sang Redis store
       */
    }),
  ],
  exports: [NestCacheModule],
})
export class AppCacheModule {}

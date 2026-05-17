/**
 * KHÁI NIỆM: Simple Cache Interceptor với RxJS of() + tap()
 *
 * TẠI SAO cần caching:
 * 1. Performance: Tránh query DB/external API cho cùng 1 request
 * 2. Cost: Giảm database load, giảm chi phí cloud
 * 3. Latency: Cache trả về nhanh hơn DB query
 *
 * RxJS OPERATOR: of()
 * - TÁC DỤNG: Tạo Observable emit 1 giá trị rồi complete ngay
 * - GIỐNG: Promise.resolve(value) nhưng cho Observable
 * - DÙNG KHI: Trả về cached value mà không cần async operation
 *
 * CÁCH HOẠT ĐỘNG:
 * 1. Request đến → check cache có data cho URL này không
 * 2. Nếu CÓ → return of(cachedData) → SKIP controller hoàn toàn
 * 3. Nếu KHÔNG → gọi controller → tap() lưu result vào cache
 *
 * ĐÂY LÀ SIMPLIFIED VERSION cho mục đích learning:
 * - In-memory Map (mất khi restart)
 * - Không có TTL (Time-To-Live)
 * - Chỉ cache GET requests
 *
 * PRODUCTION nên dùng:
 * - Redis (@nestjs/cache-manager + cache-manager-redis-store)
 * - NestJS built-in CacheModule
 * - TTL để auto-invalidate
 *
 * LỖI PHỔ BIẾN:
 * - Cache POST/PUT/DELETE → trả về data cũ cho write operations
 * - Không invalidate cache → user thấy data cũ mãi
 * - Cache quá lâu → stale data
 * - Cache quá ngắn → không có hiệu quả
 */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  /**
   * In-memory cache storage
   *
   * Map<string, { data, timestamp }>:
   * - key: Request URL (vd: /api/v1/tasks?page=1)
   * - value: { data: response data, timestamp: thời điểm cache }
   *
   * TẠI SAO dùng Map thay vì plain object:
   * - Map có .has(), .get(), .set() methods rõ ràng
   * - Map preserve insertion order
   * - Map performance tốt hơn cho frequent add/delete
   */
  private readonly cache = new Map<
    string,
    { data: unknown; timestamp: number }
  >();

  /**
   * TTL (Time-To-Live) mặc định: 60 giây
   * Sau 60s, cache entry hết hạn → query lại DB
   */
  private readonly ttlMs = 60_000;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();

    /**
     * CHỈ cache GET requests
     * TẠI SAO: POST/PUT/DELETE thay đổi data → cache sẽ stale
     */
    if (request.method !== 'GET') {
      return next.handle();
    }

    /**
     * Cache key = URL đầy đủ (bao gồm query params)
     * Ví dụ: /api/v1/tasks?page=1&limit=10
     * → Khác page = khác cache key → đúng logic
     */
    const cacheKey = request.url as string;

    /**
     * BƯỚC 1: Check cache hit
     */
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const age = Date.now() - cached.timestamp;

      /**
       * Check TTL: Cache còn hạn không?
       */
      if (age < this.ttlMs) {
        /**
         * CACHE HIT! 🎯
         *
         * OPERATOR: of(value)
         * - Tạo Observable emit cachedData rồi complete
         * - Controller KHÔNG được gọi → tiết kiệm DB query
         * - Response trả về ngay lập tức (microseconds thay vì milliseconds)
         *
         * TẠI SAO dùng of() thay vì return cachedData:
         * - intercept() phải return Observable (contract)
         * - of() wrap giá trị thành Observable
         * - Downstream interceptors (vd: ResponseTransform) vẫn hoạt động
         */
        return of(cached.data);
      }

      /**
       * Cache hết hạn → xóa entry cũ
       */
      this.cache.delete(cacheKey);
    }

    /**
     * BƯỚC 2: Cache miss → gọi controller → lưu cache
     *
     * OPERATOR: tap()
     * - Dùng tap() vì chỉ muốn SIDE-EFFECT (lưu cache)
     * - KHÔNG muốn thay đổi response data
     * - Response đi thẳng đến client, đồng thời lưu vào cache
     */
    return next.handle().pipe(
      tap((data) => {
        /**
         * Lưu response vào cache với timestamp hiện tại
         * Lần request sau sẽ trả về cached data (nếu chưa hết TTL)
         */
        this.cache.set(cacheKey, {
          data,
          timestamp: Date.now(),
        });
      }),
    );
  }
}

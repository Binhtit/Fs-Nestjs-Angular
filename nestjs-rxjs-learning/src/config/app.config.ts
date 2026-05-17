/**
 * KHÁI NIỆM: Configuration Namespace (registerAs)
 *
 * TẠI SAO dùng @nestjs/config thay vì process.env trực tiếp:
 * 1. Type-safe: ConfigService có generic type, tránh typo key name
 * 2. Validation: Có thể validate env vars khi app khởi động (fail fast)
 * 3. Default values: Định nghĩa giá trị mặc định tập trung 1 chỗ
 * 4. Testable: Dễ mock ConfigService trong unit test
 * 5. Namespace: registerAs('app', ...) tạo namespace, tránh conflict key
 *
 * LỖI PHỔ BIẾN:
 * - Dùng process.env.PORT rải rác khắp code → khó track, khó test
 * - Không có default value → app crash khi thiếu env var
 * - Hardcode giá trị → phải sửa code khi deploy environment khác
 *
 * CÁCH DÙNG:
 * ```typescript
 * // Trong service/controller:
 * constructor(private configService: ConfigService) {}
 *
 * // Lấy giá trị:
 * const port = this.configService.get<number>('app.port');
 * ```
 */
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  /**
   * Port server lắng nghe
   * Default: 3000 nếu không set APP_PORT
   */
  port: parseInt(process.env.APP_PORT ?? '3000', 10),

  /**
   * Môi trường chạy: development | staging | production
   * Dùng để điều kiện hóa behavior (vd: log level, error detail)
   */
  env: process.env.APP_ENV ?? 'development',

  /**
   * API prefix: tất cả routes sẽ có prefix này
   * Ví dụ: /api/v1/users, /api/v1/tasks
   *
   * TẠI SAO cần prefix:
   * - Versioning: dễ maintain nhiều version API song song
   * - Routing: nginx/load balancer dễ route theo prefix
   * - Convention: RESTful API standard
   */
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
}));

/**
 * KHÁI NIỆM: JWT (JSON Web Token) Configuration
 *
 * TẠI SAO dùng JWT cho authentication:
 * 1. Stateless: Server không cần lưu session → dễ scale horizontally
 * 2. Self-contained: Token chứa đủ thông tin user (payload)
 * 3. Cross-domain: Hoạt động tốt với microservices, mobile app
 *
 * PATTERN: Access Token + Refresh Token
 * - Access Token: Ngắn hạn (15 phút), dùng cho mỗi API request
 * - Refresh Token: Dài hạn (7 ngày), dùng để lấy access token mới
 *
 * TẠI SAO cần 2 token:
 * - Access token ngắn → nếu bị lộ, hacker chỉ dùng được 15 phút
 * - Refresh token dài → user không cần login lại liên tục
 * - Refresh token lưu DB → có thể revoke (force logout)
 *
 * LỖI PHỔ BIẾN:
 * - Dùng 1 token duy nhất với expiry dài → nếu lộ, hacker dùng lâu
 * - Lưu JWT secret trong code → commit lên git = lộ secret
 * - Không set expiration → token sống vĩnh viễn = nguy hiểm
 */
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  /**
   * Secret key để sign access token
   * QUAN TRỌNG: Production phải dùng key phức tạp, random
   * Recommend: openssl rand -base64 64
   */
  secret: process.env.JWT_SECRET ?? 'default-secret-change-in-production',

  /**
   * Thời gian sống của access token
   * '15m' = 15 phút: đủ ngắn để an toàn, đủ dài để user không bị gián đoạn
   *
   * Các giá trị phổ biến:
   * - '5m'  → rất an toàn nhưng user phải refresh thường xuyên
   * - '15m' → cân bằng tốt (recommended)
   * - '1h'  → tiện nhưng rủi ro cao hơn nếu token bị lộ
   */
  accessExpiration: process.env.JWT_ACCESS_EXPIRATION ?? '15m',

  /**
   * Secret riêng cho refresh token
   * TẠI SAO secret khác access token:
   * - Nếu 1 secret bị lộ, cái kia vẫn an toàn
   * - Separation of concerns: 2 mục đích khác nhau, 2 key khác nhau
   */
  refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'default-refresh-secret',

  /**
   * Thời gian sống của refresh token
   * '7d' = 7 ngày: user chỉ cần login lại mỗi tuần
   */
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION ?? '7d',
}));

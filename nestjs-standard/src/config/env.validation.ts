/**
 * KHÁI NIỆM: Config Validation — Kiểm tra env vars tại startup
 *
 * VẤN ĐỀ nếu KHÔNG có validation:
 * - App start thành công dù thiếu JWT_SECRET
 * - Đến khi user gọi API /login → mới bị lỗi âm thầm
 * - Khó debug, không rõ nguyên nhân
 *
 * GIẢI PHÁP: "Fail Fast" — app TỪ CHỐI khởi động nếu config sai
 * → Lỗi xuất hiện ngay khi deploy, không phải lúc user dùng
 * → Log rõ ràng: "JWT_SECRET is required" thay vì lỗi runtime khó hiểu
 *
 * CÔNG CỤ: Joi — thư viện validation schema phổ biến nhất cho Node.js
 *
 * FLOW:
 * 1. App khởi động → ConfigModule đọc .env
 * 2. ConfigModule chạy validationSchema (Joi)
 * 3. Nếu validation fail → throw Error → app crash ngay
 * 4. Nếu pass → các service mới được khởi tạo
 *
 * CÁC LOẠI RULE JOI:
 * - .required() → field BẮT BUỘC có (không được undefined/null)
 * - .default(value) → giá trị mặc định nếu không cung cấp
 * - .valid(...values) → chỉ chấp nhận các giá trị trong danh sách
 * - .number() / .string() → type check
 * - .min() / .max() → giới hạn giá trị
 *
 * CÁCH DÙNG: Import vào ConfigModule.forRoot({ validationSchema })
 * trong app.module.ts
 */
import * as Joi from 'joi';

/**
 * Schema kiểm tra TẤT CẢ environment variables
 *
 * Thêm field mới ở đây khi project cần thêm env var
 * → 1 chỗ duy nhất để biết app cần những config gì
 */
export const envValidationSchema = Joi.object({
  /**
   * APP CONFIG
   * NODE_ENV: Môi trường chạy → ảnh hưởng nhiều behavior (logging, error details...)
   * APP_PORT: Port server lắng nghe request
   */
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  APP_PORT: Joi.number().default(3001),

  /**
   * DATABASE
   * DATABASE_URL: Đường dẫn file SQLite hoặc connection string DB khác
   * Format SQLite: 'file:./prisma/dev.db'
   * Format PostgreSQL: 'postgresql://user:pass@host:5432/dbname'
   */
  DATABASE_URL: Joi.string().default('file:./prisma/dev.db'),

  /**
   * JWT SECRETS — BẮT BUỘC, không có thì app không hoạt động được
   *
   * JWT_SECRET: Ký access token (ngắn hạn — 15 phút)
   * JWT_REFRESH_SECRET: Ký refresh token (dài hạn — 7 ngày)
   *
   * LƯU Ý BẢO MẬT:
   * - Phải là chuỗi random dài (tối thiểu 32 ký tự)
   * - KHÔNG được commit vào git
   * - Production: dùng secrets manager (AWS Secrets Manager, Vault...)
   * - Hai secret PHẢI KHÁC NHAU (tránh dùng refresh token như access token)
   */
  JWT_SECRET: Joi.string().required().min(8),
  JWT_REFRESH_SECRET: Joi.string().required().min(8),
});

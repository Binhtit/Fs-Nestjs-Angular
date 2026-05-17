/**
 * KHÁI NIỆM: Swagger / OpenAPI Documentation
 *
 * TẠI SAO cần Swagger:
 * 1. Auto-generate API docs từ code → luôn up-to-date
 * 2. Interactive: Frontend dev / QA test API trực tiếp trên browser
 * 3. Contract: Backend và Frontend thống nhất API format trước khi code
 * 4. Onboarding: Dev mới join team hiểu API nhanh hơn
 *
 * CÁCH HOẠT ĐỘNG:
 * - NestJS đọc decorators (@ApiTags, @ApiProperty, @ApiBearerAuth, ...)
 * - Tự động generate OpenAPI spec (JSON/YAML)
 * - Swagger UI render spec thành interactive docs
 *
 * LỖI PHỔ BIẾN:
 * - Không dùng @ApiProperty() trong DTO → Swagger không hiện field
 * - Quên @ApiBearerAuth() → không test được protected endpoint
 * - Để Swagger enabled trong production → lộ API structure
 */
import { DocumentBuilder } from '@nestjs/swagger';

/**
 * Tạo Swagger config object
 *
 * PATTERN: Builder Pattern
 * DocumentBuilder dùng method chaining để build config step-by-step
 * → Code dễ đọc, dễ maintain hơn object literal lớn
 */
export const createSwaggerConfig = () => {
  return new DocumentBuilder()
    /**
     * Tiêu đề hiển thị trên Swagger UI
     */
    .setTitle('NestJS + RxJS Learning API')

    /**
     * Mô tả chi tiết về API
     */
    .setDescription(
      'Dự án học NestJS + RxJS với comment tiếng Việt chi tiết. ' +
        'Mỗi endpoint đều có giải thích concept, WHY, và common mistakes.',
    )

    /**
     * Version API - matching với API_PREFIX
     */
    .setVersion('1.0')

    /**
     * Thêm Bearer Authentication scheme
     *
     * TẠI SAO cần addBearerAuth():
     * - Swagger UI hiện nút "Authorize" → nhập JWT token
     * - Tự động gửi header: Authorization: Bearer <token>
     * - Không cần copy-paste token vào mỗi request
     *
     * 'JWT-auth' là tên reference, dùng với @ApiBearerAuth('JWT-auth')
     */
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT access token (không cần prefix "Bearer")',
      },
      'JWT-auth',
    )

    .build();
};

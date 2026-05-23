/**
 * KHÁI NIỆM: NestJS Application Bootstrap
 *
 * main.ts là ENTRY POINT — nơi khởi tạo và cấu hình app:
 * 1. NestFactory.create() → tạo ứng dụng NestJS
 * 2. Global pipes, filters, interceptors → apply cho TẤT CẢ routes
 * 3. Swagger → tạo API docs tự động
 * 4. CORS → cho phép FE khác domain gọi API
 * 5. listen(port) → bắt đầu lắng nghe HTTP requests
 *
 * THỨ TỰ QUAN TRỌNG:
 * - Middleware → Guard → Interceptor (before) → Pipe → Handler → Interceptor (after) → Filter (if error)
 *
 * LỖI PHỔ BIẾN:
 * - Quên enableCors() → FE gọi API bị CORS block
 * - Quên ValidationPipe → DTO validation không hoạt động
 * - Port conflict → đổi port trong .env
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * NestFactory.create(): Khởi tạo NestJS application
   * AppModule là ROOT MODULE — chứa tất cả imports
   */
  /**
   * NestExpressApplication: Typed version cho Express adapter
   * Cần để dùng app.useStaticAssets() (serve static files)
   */
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // ====================================================================
  // SECURITY: Helmet → thêm HTTP security headers
  // Chặn: XSS, clickjacking, MIME sniffing attacks
  // ====================================================================
  app.use(helmet());

  // ====================================================================
  // PERFORMANCE: Compression → nén response bằng gzip
  // Giảm ~70% kích thước response → load nhanh hơn
  // ====================================================================
  app.use(compression());

  // ====================================================================
  // CORS: Cross-Origin Resource Sharing
  // Cho phép Angular (localhost:4200) gọi API (localhost:3001)
  // Production: đổi origin: '*' thành domain cụ thể
  // ====================================================================
  app.enableCors({ origin: '*' });

  // ====================================================================
  // STATIC FILES: Serve uploaded files qua HTTP
  // Ví dụ: /uploads/1703123456789-abc.jpg → file trên disk
  // useStaticAssets(path, options): Giống Express static middleware
  // ====================================================================
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  // ====================================================================
  // API PREFIX: Tất cả routes có prefix /api/v1
  // Ví dụ: /api/v1/users, /api/v1/posts
  // TẠI SAO: Versioning API, dễ routing qua nginx/load balancer
  // ====================================================================
  app.setGlobalPrefix('api/v1');

  // ====================================================================
  // GLOBAL VALIDATION PIPE
  //
  // class-validator decorators (@IsEmail, @MinLength...) trong DTO
  // CHỈ HOẠT ĐỘNG khi có ValidationPipe global
  //
  // whitelist: true → loại bỏ fields không khai báo trong DTO
  //   Ví dụ: DTO chỉ có { email, password }
  //   Nếu client gửi { email, password, isAdmin: true }
  //   → isAdmin bị tự động xóa (bảo mật!)
  //
  // transform: true → auto-convert types
  //   Ví dụ: query string "page=1" (string) → page: 1 (number)
  //
  // forbidNonWhitelisted: true → throw error nếu có field lạ
  //   Ví dụ: gửi { isAdmin: true } → 400 Bad Request
  // ====================================================================
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // ====================================================================
  // SWAGGER: Tự động generate API docs từ decorators
  //
  // @ApiTags('Users') → nhóm endpoints
  // @ApiOperation({ summary: 'xxx' }) → mô tả endpoint
  // @ApiBearerAuth() → hiện ổ khóa JWT trong Swagger UI
  //
  // Truy cập: http://localhost:3001/api-docs
  // ====================================================================
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Blog API — NestJS Standard MVC')
    .setDescription(
      'Dự án Blog API theo cấu trúc Standard MVC (Modular Monolith) — ' +
      'cấu trúc phổ biến nhất trong các dự án NestJS thực tế.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT token (không cần prefix "Bearer ")',
      },
      'JWT-auth', // Tên security scheme — dùng trong @ApiBearerAuth('JWT-auth')
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  // ====================================================================
  // PORT: Lấy từ env, mặc định 3001 (tránh conflict với dự án DDD ở 3000)
  // ====================================================================
  const port = process.env.APP_PORT ?? 3001;
  await app.listen(port);

  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
}

void bootstrap();

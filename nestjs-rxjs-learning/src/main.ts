/**
 * ENTRY POINT - Bootstrap ứng dụng NestJS
 *
 * FLOW KHỞI ĐỘNG:
 * 1. Tạo NestJS app instance
 * 2. Security: Helmet (headers), CORS, Compression
 * 3. Global prefix: /api/v1
 * 4. Swagger setup
 * 5. Listen on port
 */
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');
import helmet from 'helmet';
import { AppModule } from './app.module';
import { createSwaggerConfig } from './config/swagger.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  /** 1. Tạo app instance */
  const app = await NestFactory.create(AppModule);

  /** 2. Security & Performance Middleware */
  app.use(helmet());               // Security headers
  app.use(compression());          // Gzip compression
  app.enableCors({ origin: '*' }); // CORS (production: set specific origins)

  /** 3. Global prefix */
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get<string>('app.apiPrefix') ?? 'api/v1';
  app.setGlobalPrefix(apiPrefix, {
    exclude: ['health'], // Health check không cần prefix
  });

  /** 4. Swagger setup */
  const swaggerConfig = createSwaggerConfig();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  /** 5. Start server */
  const port = configService.get<number>('app.port') ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Server running on http://localhost:${port}`);
  logger.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
  logger.log(`💚 Health check: http://localhost:${port}/health`);
  logger.log(`🔌 WebSocket: ws://localhost:${port}/realtime`);
}

bootstrap();

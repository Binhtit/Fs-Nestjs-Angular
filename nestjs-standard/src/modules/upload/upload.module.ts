/**
 * Upload Module — Đóng gói file upload functionality
 *
 * Multer đã được bundle sẵn trong @nestjs/platform-express
 * → Không cần import MulterModule đặc biệt nếu dùng diskStorage trực tiếp
 */
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
})
export class UploadModule {}

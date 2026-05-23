/**
 * KHÁI NIỆM: File Upload với Multer
 *
 * MULTER là gì:
 * - Middleware xử lý multipart/form-data (format gửi file qua HTTP)
 * - @nestjs/platform-express đã bundle sẵn Multer → không cần cài thêm
 * - Chỉ cần cài @types/multer cho TypeScript types
 *
 * CÁC DECORATOR QUAN TRỌNG:
 *
 * @UseInterceptors(FileInterceptor('fieldName')):
 * → Kích hoạt Multer để parse multipart/form-data
 * → 'fieldName': tên field trong form (phải match với key trong Postman/FE)
 *
 * @UploadedFile(pipe?):
 * → Inject file đã parse vào parameter
 * → Có thể truyền Pipe để validate (FileValidationPipe)
 *
 * MULTER STORAGE OPTIONS:
 * 1. diskStorage: Lưu file ra disk (local hoặc mount)
 *    - destination: Thư mục lưu
 *    - filename: Tên file (thường thêm timestamp/uuid để tránh trùng)
 * 2. memoryStorage: Giữ file trong RAM (buffer)
 *    - Dùng khi cần process trước (resize, compress) rồi mới lưu
 *    - KHÔNG dùng cho production với file lớn (hết RAM)
 *
 * FLOW:
 * Client → POST /upload/image (multipart/form-data)
 * → FileInterceptor (Multer) parse → lưu vào uploads/
 * → FileValidationPipe validate type + size
 * → Controller nhận Express.Multer.File object
 * → Trả về URL có thể truy cập
 */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { FileValidationPipe } from '../../common/pipes/file-validation.pipe';

@ApiTags('Upload')
@ApiBearerAuth('JWT-auth')
@Controller('upload')
export class UploadController {
  /**
   * POST /api/v1/upload/image
   *
   * Nhận 1 file ảnh → lưu vào thư mục uploads/ → trả về URL
   *
   * @ApiConsumes('multipart/form-data'): Báo Swagger endpoint nhận file
   * @ApiBody: Định nghĩa schema cho Swagger UI (hiện file input)
   */
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      /**
       * diskStorage: Cấu hình lưu file ra disk
       *
       * destination: Thư mục lưu file
       * → cb(null, 'uploads') → lưu vào thư mục uploads/
       * → cb(error, ...) → Multer sẽ throw error
       */
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, 'uploads');
        },

        /**
         * filename: Tạo tên file unique
         *
         * TẠI SAO không giữ tên file gốc:
         * - Trùng tên → ghi đè file cũ
         * - Tên tiếng Việt → encoding issues
         * - Tên có ký tự đặc biệt → path traversal attack
         *
         * GIẢI PHÁP: timestamp + random string + extension gốc
         * Ví dụ: avatar.jpg → 1703123456789-abc123.jpg
         */
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname); // Lấy extension: '.jpg', '.png'...
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),

      /**
       * limits: Giới hạn ở tầng Multer (tầng đầu tiên)
       * FileValidationPipe sẽ validate lại ở tầng pipe (chặt hơn)
       *
       * fileSize: bytes (10MB hard limit — để tránh memory spike)
       */
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB hard limit
        files: 1, // Chỉ nhận 1 file mỗi request
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'File ảnh cần upload',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({ summary: 'Upload ảnh (JPEG, PNG, GIF, WebP — tối đa 5MB)' })
  uploadImage(
    /**
     * @UploadedFile(pipe): Inject file + validate qua pipe
     *
     * FileValidationPipe: Validate MIME type + size
     * → Nếu fail → throw BadRequestException trước khi vào controller logic
     */
    @UploadedFile(new FileValidationPipe({ maxSizeMB: 5 }))
    file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Không có file nào được gửi lên');
    }

    /**
     * Trả về URL để client có thể dùng ngay
     *
     * file.filename: Tên file đã được lưu (tên unique)
     * URL pattern: /uploads/{filename} → serve bởi static assets
     *
     * Production: Trả về CDN URL thay vì local path
     */
    return {
      url: `/uploads/${file.filename}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}

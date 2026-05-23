/**
 * KHÁI NIỆM: File Validation Pipe
 *
 * UPLOAD FILE CÓ RỦI RO GÌ:
 * - User upload file .exe, .php, .sh → server bị tấn công
 * - User upload file 10GB → hết disk
 * - User spoof MIME type (đổi tên file.php → file.jpg)
 *
 * GIẢI PHÁP: Validate file tại Pipe TRƯỚC khi xử lý
 * - Kiểm tra MIME type (mimetype field trong Multer)
 * - Kiểm tra kích thước (size field)
 * - Không kiểm tra extension (dễ giả mạo)
 *
 * TẠI SAO dùng Pipe thay vì validate trong Service:
 * - Pipe chạy trước controller handler → fail sớm
 * - Service không phải lo về validation → Single Responsibility
 * - Tái sử dụng: apply cho nhiều upload endpoints
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Post('image')
 * @UseInterceptors(FileInterceptor('file'))
 * uploadImage(
 *   @UploadedFile(new FileValidationPipe({ maxSizeMB: 5 }))
 *   file: Express.Multer.File
 * ) { ... }
 * ```
 */
import {
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';

/** Options cho FileValidationPipe */
export interface FileValidationOptions {
  /** Kích thước tối đa tính bằng MB (mặc định: 5MB) */
  maxSizeMB?: number;
  /** Danh sách MIME types chấp nhận (mặc định: image/*) */
  allowedMimeTypes?: string[];
}

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSizeBytes: number;
  private readonly allowedMimeTypes: string[];

  constructor(options: FileValidationOptions = {}) {
    this.maxSizeBytes = (options.maxSizeMB ?? 5) * 1024 * 1024; // Default 5MB
    this.allowedMimeTypes = options.allowedMimeTypes ?? [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];
  }

  transform(file: Express.Multer.File): Express.Multer.File {
    /** File không được gửi lên → báo lỗi rõ ràng */
    if (!file) {
      throw new BadRequestException('File là bắt buộc');
    }

    /**
     * Kiểm tra MIME type
     *
     * QUAN TRỌNG: Kiểm tra file.mimetype (do Multer detect)
     * KHÔNG kiểm tra extension (dễ giả mạo: đổi .exe → .jpg)
     * Multer đọc magic bytes đầu file → reliable hơn extension
     */
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Loại file không hợp lệ. Chỉ chấp nhận: ${this.allowedMimeTypes.join(', ')}. ` +
          `Nhận được: ${file.mimetype}`,
      );
    }

    /**
     * Kiểm tra kích thước
     *
     * file.size: Kích thước tính bằng bytes (do Multer cung cấp)
     */
    if (file.size > this.maxSizeBytes) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const maxMB = (this.maxSizeBytes / (1024 * 1024)).toFixed(0);
      throw new BadRequestException(
        `File quá lớn (${sizeMB}MB). Tối đa ${maxMB}MB.`,
      );
    }

    return file;
  }
}

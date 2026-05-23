/**
 * KHÁI NIỆM: Custom Pipe — ParsePositiveIntPipe (Validation Pipe)
 *
 * PIPE NÀY (ParsePositiveIntPipe):
 * - Loại: Validation + Transformation
 * - Tác dụng: Chuyển string → number VÀ kiểm tra phải là số nguyên dương (> 0)
 * - Vấn đề giải quyết: URL /users/-1 hoặc /users/0 phải bị reject sớm
 *
 * TẠI SAO không dùng ParseIntPipe có sẵn:
 * - ParseIntPipe: chấp nhận cả số âm và 0 → service phải check thêm
 * - ParsePositiveIntPipe: reject ngay ở tầng pipe → service không cần lo
 * → "Validate ở tầng sớm nhất có thể" — nguyên tắc Clean Architecture
 *
 * SO SÁNH:
 * - ParseIntPipe (built-in): "1" → 1, "abc" → 400, "-1" → -1 (PASS)
 * - ParsePositiveIntPipe (custom): "1" → 1, "-1" → 400, "0" → 400
 *
 * CÁCH DÙNG:
 * ```typescript
 * @Get(':id')
 * findOne(@Param('id', ParsePositiveIntPipe) id: number) { ... }
 * ```
 *
 * LỖI PHỔ BIẾN:
 * - Dùng ParseIntPipe rồi check < 0 trong service → duplicate logic
 * - Quên validate → DB query với id âm → Prisma lỗi khó hiểu
 */
import {
  Injectable,
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<string, number> {
  /**
   * transform(): Validation + Transformation
   *
   * @param value - String từ URL param (VD: "1", "-5", "abc")
   * @param metadata - Chứa type='param', data='id' (tên param)
   * @returns number dương
   * @throws BadRequestException nếu không hợp lệ
   */
  transform(value: string, metadata: ArgumentMetadata): number {
    const paramName = metadata.data ?? 'value'; // Tên param để báo lỗi rõ hơn

    /** Bước 1: Parse string → number */
    const parsed = parseInt(value, 10);

    /**
     * isNaN(): Kiểm tra parse có thành công không
     * parseInt('abc') → NaN → không phải số → 400
     * parseInt('1.5') → 1 (bỏ decimal) → OK (chấp nhận)
     */
    if (isNaN(parsed)) {
      throw new BadRequestException(
        `Tham số "${paramName}" phải là số nguyên, nhận được: "${value}"`,
      );
    }

    /** Bước 2: Kiểm tra phải > 0 */
    if (parsed <= 0) {
      throw new BadRequestException(
        `Tham số "${paramName}" phải là số nguyên dương (> 0), nhận được: ${parsed}`,
      );
    }

    return parsed;
  }
}

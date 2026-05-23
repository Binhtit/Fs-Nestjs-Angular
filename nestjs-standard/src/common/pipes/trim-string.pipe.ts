/**
 * KHÁI NIỆM: Custom Pipe — TrimStringPipe (Transformation Pipe)
 *
 * PIPE là gì:
 * - Chạy SAU khi request được parse, TRƯỚC khi vào Handler (Controller method)
 * - Có 2 mục đích: TRANSFORMATION (biến đổi) và VALIDATION (kiểm tra)
 * - Tương tự assembly line: data đi qua từng pipe, mỗi pipe xử lý 1 việc
 *
 * SO SÁNH 5 BUILDING BLOCKS:
 * ┌─────────────────┬────────────────────────────────────────────────┐
 * │ Component       │ Mục đích                                       │
 * ├─────────────────┼────────────────────────────────────────────────┤
 * │ Middleware      │ Request/Response thô, chạy trước guard         │
 * │ Guard           │ Quyết định "có được vào không" (auth/roles)    │
 * │ Interceptor     │ Bọc handler, transform response, logging       │
 * │ Pipe            │ Validate/transform INPUT DATA (params, body)   │
 * │ Filter          │ Xử lý Exception sau khi handler throw          │
 * └─────────────────┴────────────────────────────────────────────────┘
 *
 * LOẠI PIPE:
 * 1. TRANSFORMATION: Không throw lỗi, chỉ biến đổi data
 *    Ví dụ: TrimStringPipe (xóa space), ParseIntPipe (string→number)
 *
 * 2. VALIDATION: Throw BadRequestException nếu data không hợp lệ
 *    Ví dụ: ValidationPipe (class-validator), ParsePositiveIntPipe
 *
 * PIPE NÀY (TrimStringPipe):
 * - Loại: Transformation
 * - Tác dụng: Bỏ khoảng trắng đầu/cuối của mọi string trong request body
 * - Vấn đề giải quyết: User nhập "  admin@example.com  " → lưu DB luôn có space thừa
 *
 * CÁCH DÙNG:
 * ```typescript
 * // Áp dụng cho toàn bộ body object
 * @Post()
 * create(@Body(TrimStringPipe) dto: CreatePostDto) { ... }
 *
 * // Áp dụng cho 1 field cụ thể
 * @Get()
 * search(@Query('q', TrimStringPipe) q: string) { ... }
 * ```
 */
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class TrimStringPipe implements PipeTransform {
  /**
   * transform(): Method bắt buộc của PipeTransform interface
   *
   * @param value - Giá trị đầu vào (body, param, query...)
   * @param metadata - Thông tin về nguồn gốc: type ('body'|'param'|'query'), metatype (class DTO)
   * @returns Giá trị đã được transform
   *
   * KHÔNG throw exception → đây là transformation pipe
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    /**
     * Xử lý đệ quy để trim TẤT CẢ string trong object
     * (bao gồm cả nested objects)
     */
    return this.trimValue(value);
  }

  private trimValue(value: unknown): unknown {
    /** String đơn → trim trực tiếp */
    if (typeof value === 'string') {
      return value.trim();
    }

    /** Array → trim từng element */
    if (Array.isArray(value)) {
      return value.map((item) => this.trimValue(item));
    }

    /**
     * Object (ví dụ DTO body) → trim từng field string
     * LƯU Ý: Bỏ qua null, undefined, Date, và các non-plain objects
     */
    if (value !== null && typeof value === 'object' && value.constructor === Object) {
      const trimmed: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        trimmed[key] = this.trimValue(val);
      }
      return trimmed;
    }

    /** Number, boolean, null, Date... → giữ nguyên */
    return value;
  }
}

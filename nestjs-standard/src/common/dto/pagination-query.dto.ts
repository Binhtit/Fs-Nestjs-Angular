/**
 * KHÁI NIỆM: Pagination Query DTO — Tham số phân trang chung
 *
 * DTO (Data Transfer Object): Định nghĩa SHAPE dữ liệu vào/ra
 *
 * TẠI SAO tách PaginationQueryDto riêng:
 * - Pagination dùng ở NHIỀU endpoints: GET /posts, GET /users, GET /comments
 * - Tách riêng → kế thừa (extends) → không lặp code
 * - Validation tập trung 1 chỗ
 *
 * CÁCH DÙNG:
 * ```typescript
 * // QueryPostDto kế thừa PaginationQueryDto
 * class QueryPostDto extends PaginationQueryDto {
 *   @IsOptional()
 *   categoryId?: number; // Thêm filter riêng cho Post
 * }
 * ```
 *
 * DECORATORS CLASS-VALIDATOR:
 * - @IsOptional(): Field không bắt buộc
 * - @IsInt(): Phải là số nguyên
 * - @Min(1): Giá trị tối thiểu
 * - @Max(100): Giá trị tối đa (chống client request limit=999999)
 * - @IsIn([...]): Chỉ chấp nhận giá trị trong danh sách
 *
 * DECORATORS CLASS-TRANSFORMER:
 * - @Type(() => Number): Convert string → number
 *   Query string luôn là STRING: ?page=1 → page: "1"
 *   Type(() => Number) → page: 1 (number)
 */
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Số trang (bắt đầu từ 1)', default: 1 })
  @IsOptional()
  @Type(() => Number) // String → Number conversion
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số item mỗi trang', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Giới hạn max 100 item/page — tránh query quá nặng
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Sắp xếp theo field',
    default: 'createdAt',
  })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Thứ tự sắp xếp',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

/**
 * KHÁI NIỆM: Category DTOs — Dữ liệu đầu vào cho danh mục
 *
 * CATEGORY FIELDS:
 * - name: Tên hiển thị ("Backend", "Frontend")
 * - description: Mô tả (optional)
 * - slug: URL-friendly → TỰ GENERATE trong Service
 *
 * CREATE vs UPDATE:
 * - Create: name BẮT BUỘC
 * - Update: TẤT CẢ optional (PATCH = partial update)
 */
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO tạo category mới */
export class CreateCategoryDto {
  @ApiProperty({ example: 'Backend', description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Các bài viết về Backend development' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

/** DTO cập nhật category — tất cả fields optional */
export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Backend Development' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

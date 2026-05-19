/**
 * KHÁI NIỆM: Post DTOs — Định nghĩa dữ liệu đầu vào cho bài viết
 *
 * FILE NÀY CHỨA 3 DTO:
 * 1. CreatePostDto  → POST /posts (tạo bài viết)
 * 2. UpdatePostDto  → PATCH /posts/:id (cập nhật bài viết)
 * 3. QueryPostDto   → GET /posts?... (filter + phân trang)
 *
 * PATTERN QUAN TRỌNG:
 *
 * 1. CREATE vs UPDATE DTO:
 *    - Create: Các field bắt buộc (@IsNotEmpty) + optional fields
 *    - Update: TẤT CẢ fields đều @IsOptional (chỉ gửi field cần sửa)
 *    → PATCH method = partial update (khác PUT = replace toàn bộ)
 *
 * 2. QUERY DTO KẾ THỪA:
 *    - QueryPostDto extends PaginationQueryDto
 *    - PaginationQueryDto có sẵn: page, limit, sortBy, sortOrder
 *    - QueryPostDto thêm: search, status, categoryId, tagId
 *    → DRY: không lặp lại code phân trang ở mỗi feature
 *
 * 3. @Type(() => Number):
 *    - Query string luôn là STRING: ?categoryId=1 → "1" (string)
 *    - @Type(() => Number) convert: "1" → 1 (number)
 *    - Cần kết hợp với transform: true trong ValidationPipe (main.ts)
 *
 * DECORATORS TỔNG HỢP:
 * - @IsString(), @IsNotEmpty(), @MaxLength() → validate string
 * - @IsOptional() → field không bắt buộc
 * - @IsInt() → phải là số nguyên
 * - @IsIn([...]) → chỉ chấp nhận giá trị trong danh sách
 * - @IsArray() → phải là array
 * - @Type(() => Number) → class-transformer: convert type
 * - @ApiProperty() → bắt buộc, hiện trong Swagger
 * - @ApiPropertyOptional() → optional, hiện trong Swagger
 */
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsInt, IsIn, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

/**
 * DTO tạo bài viết mới
 *
 * Bắt buộc: title, content
 * Tùy chọn: excerpt, thumbnail, categoryId, tagIds
 */
export class CreatePostDto {
  @ApiProperty({ example: 'Học NestJS từ zero đến hero' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Nội dung bài viết chi tiết...' })
  @IsString()
  @IsNotEmpty()
  content: string;

  /** Tóm tắt ngắn — hiện ở danh sách bài viết, không cần đọc full content */
  @ApiPropertyOptional({ example: 'Tóm tắt ngắn gọn' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string;

  /** URL ảnh đại diện bài viết */
  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  thumbnail?: string;

  /**
   * ID danh mục — quan hệ 1-nhiều (1 category → nhiều posts)
   * @Type(() => Number): Convert string → number (từ form data)
   */
  @ApiPropertyOptional({ example: 1, description: 'ID danh mục' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  /**
   * Mảng tag IDs — quan hệ nhiều-nhiều qua bảng PostTag
   *
   * Ví dụ: tagIds: [1, 2, 3] → tạo 3 rows trong PostTag:
   * { postId: X, tagId: 1 }, { postId: X, tagId: 2 }, { postId: X, tagId: 3 }
   */
  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: 'Mảng tag IDs',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  tagIds?: number[];
}

/**
 * DTO cập nhật bài viết — TẤT CẢ fields optional
 *
 * PATCH method: Client chỉ gửi field muốn thay đổi
 * Ví dụ: { title: 'Tiêu đề mới' } → chỉ update title, giữ nguyên content
 *
 * Thêm: status field — cho phép đổi trạng thái bài viết
 * DRAFT → PUBLISHED → ARCHIVED
 */
export class UpdatePostDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  excerpt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  thumbnail?: string;

  /**
   * Trạng thái bài viết
   * @IsIn(): Chỉ chấp nhận 3 giá trị cố định
   * → Gửi status: 'INVALID' → 400 Bad Request
   */
  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  /** Gửi tagIds mới → service sẽ XÓA tags cũ + TẠO tags mới (replace all) */
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  tagIds?: number[];
}

/**
 * DTO query params cho GET /posts
 *
 * KẾ THỪA PaginationQueryDto:
 * → Có sẵn: page, limit, sortBy, sortOrder
 * → Thêm riêng: search, status, categoryId, tagId
 *
 * SỬ DỤNG: GET /api/v1/posts?page=1&limit=10&search=nestjs&categoryId=1
 *
 * TẠI SAO dùng extends thay vì copy fields:
 * - 1 chỗ sửa (PaginationQueryDto) → tất cả query DTOs cập nhật
 * - Đảm bảo pagination hoạt động GIỐNG NHAU ở mọi endpoint
 */
export class QueryPostDto extends PaginationQueryDto {
  /** Tìm kiếm theo title — Prisma dùng contains (LIKE '%search%') */
  @ApiPropertyOptional({ description: 'Tìm kiếm theo title' })
  @IsOptional()
  @IsString()
  search?: string;

  /** Filter theo trạng thái: DRAFT, PUBLISHED, ARCHIVED */
  @ApiPropertyOptional({ enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'] })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: string;

  /** Filter theo category — quan hệ 1-nhiều */
  @ApiPropertyOptional({ description: 'Filter theo category ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  /**
   * Filter theo tag — quan hệ nhiều-nhiều
   * Prisma query: where: { tags: { some: { tagId } } }
   * → Tìm posts có BẤT KỲ PostTag nào match tagId
   */
  @ApiPropertyOptional({ description: 'Filter theo tag ID' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  tagId?: number;
}

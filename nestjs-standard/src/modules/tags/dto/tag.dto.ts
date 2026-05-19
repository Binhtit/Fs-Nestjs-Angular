/**
 * KHÁI NIỆM: Tag DTO — Định nghĩa dữ liệu đầu vào khi tạo tag
 *
 * ĐƠN GIẢN NHẤT trong các DTOs vì Tag chỉ có 1 field: name
 * (slug được generate tự động trong service, không cần client gửi)
 *
 * SO SÁNH CÁC DTO TRONG DỰ ÁN:
 * ┌────────────────────┬────────────────────────────────────────┐
 * │ DTO                │ Fields                                 │
 * ├────────────────────┼────────────────────────────────────────┤
 * │ CreateTagDto       │ name                                   │
 * │ CreateCategoryDto  │ name, description                      │
 * │ CreatePostDto      │ title, content, excerpt, thumbnail,    │
 * │                    │ categoryId, tagIds                     │
 * │ RegisterDto        │ email, password, name                  │
 * └────────────────────┴────────────────────────────────────────┘
 *
 * TẠI SAO KHÔNG CÓ UpdateTagDto:
 * - Tag chỉ có name → nếu muốn đổi tên → xóa tag cũ, tạo tag mới
 * - Nếu cần update: tạo UpdateTagDto extends PartialType(CreateTagDto)
 *
 * DECORATORS:
 * - @IsString(): Validate phải là string (không phải number, object...)
 * - @IsNotEmpty(): Không được gửi string rỗng ""
 * - @MaxLength(50): Giới hạn 50 ký tự (tag thường ngắn)
 * - @ApiProperty(): Swagger docs — hiện field trong Swagger UI
 */
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/** DTO tạo tag mới — chỉ cần tên, slug tự generate */
export class CreateTagDto {
  @ApiProperty({ example: 'NestJS', description: 'Tên tag' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;
}

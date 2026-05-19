/**
 * KHÁI NIỆM: Comment DTOs — Dữ liệu đầu vào cho bình luận
 *
 * COMMENT LÀ NESTED RESOURCE:
 * - Comment không tồn tại độc lập → luôn thuộc 1 Post
 * - postId được lấy từ URL: /posts/:postId/comments
 * - authorId được lấy từ JWT token (@CurrentUser('id'))
 * → DTO chỉ cần chứa CONTENT (nội dung bình luận)
 *
 * TẠI SAO DTO KHÔNG CÓ postId VÀ authorId:
 * - postId: Lấy từ URL params → Controller truyền vào Service
 * - authorId: Lấy từ JWT → đảm bảo user không giả mạo ID
 * - Nếu cho client gửi authorId → attacker có thể gửi authorId khác
 *
 * CREATE vs UPDATE:
 * - CreateCommentDto: content BẮT BUỘC (@IsNotEmpty)
 * - UpdateCommentDto: content TÙY CHỌN (@IsOptional)
 * → PATCH method: chỉ gửi field muốn sửa
 *
 * @MaxLength(2000): Giới hạn độ dài comment
 * → Tránh spam/abuse (client gửi 1 triệu ký tự)
 * → Tùy business: có thể tăng/giảm
 */
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** DTO tạo comment — content bắt buộc */
export class CreateCommentDto {
  @ApiProperty({ example: 'Bài viết rất hay!' })
  @IsString()
  @IsNotEmpty({ message: 'Nội dung bình luận không được rỗng' })
  @MaxLength(2000)
  content: string;
}

/** DTO sửa comment — content tùy chọn (PATCH) */
export class UpdateCommentDto {
  @ApiPropertyOptional({ example: 'Nội dung đã sửa' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}

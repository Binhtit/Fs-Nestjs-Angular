/**
 * KHÁI NIỆM: Update User DTO — Dữ liệu đầu vào khi cập nhật user
 *
 * TẤT CẢ fields đều @IsOptional — PATCH method:
 * - Chỉ gửi field cần sửa
 * - Ví dụ: { name: 'Tên mới' } → chỉ update name, giữ nguyên email + role
 *
 * PHÂN QUYỀN (xử lý ở Controller, không phải DTO):
 * - Chỉ ADMIN mới gọi được PATCH /users/:id
 * - ADMIN có thể đổi role user khác (READER → AUTHOR)
 *
 * LƯU Ý BẢO MẬT:
 * - Không có password field → đổi mật khẩu cần endpoint riêng
 * - @IsIn(['ADMIN', 'AUTHOR', 'READER']): Chặn role không hợp lệ
 * - @IsEmail(): Validate format email khi đổi email
 */
import { IsOptional, IsString, IsEmail, MaxLength, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyễn Văn B' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'new@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  /** Chỉ chấp nhận 3 role cố định — @IsIn validate giá trị */
  @ApiPropertyOptional({ enum: ['ADMIN', 'AUTHOR', 'READER'] })
  @IsOptional()
  @IsIn(['ADMIN', 'AUTHOR', 'READER'])
  role?: string;
}

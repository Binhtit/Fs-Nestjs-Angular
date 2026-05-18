/**
 * KHÁI NIỆM: Data Transfer Object (DTO) Pattern
 *
 * TẠI SAO tách DTO khỏi Entity:
 * 1. Security: Client không biết DB schema thật (ẩn fields: password, refreshToken)
 * 2. Validation: DTO có validation rules, Entity không có
 * 3. Flexibility: Input format khác DB format
 *    Ví dụ: Client gửi { confirmPassword }, DB không lưu confirmPassword
 * 4. Versioning: Đổi DTO không ảnh hưởng DB, đổi Entity không ảnh hưởng API
 *
 * LỖI PHỔ BIẾN:
 * - Dùng Entity làm DTO → lộ DB schema, không có validation
 * - Dùng 1 DTO cho cả create/update → update phải gửi TẤT CẢ fields
 */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  /**
   * @IsEmail(): Validate format email (có @, domain, etc.)
   *
   * TẠI SAO cần cả @IsEmail và @IsNotEmpty:
   * - @IsEmail không check empty string ('' pass @IsEmail ở một số version)
   * - @IsNotEmpty đảm bảo field không rỗng
   * - Defense in depth: Nhiều lớp validation tốt hơn 1 lớp
   */
  @ApiProperty({ example: 'user@example.com', description: 'Email đăng nhập' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email!: string;

  /**
   * @MinLength(6): Password phải ít nhất 6 ký tự
   *
   * TẠI SAO 6 ký tự minimum:
   * - Quá ngắn → dễ brute-force
   * - Quá dài requirement → user dùng password đơn giản + ghi sticky note
   * - 6 là minimum hợp lý cho learning project
   * - Production: Recommend 8+ với complexity requirements
   */
  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu (tối thiểu 6 ký tự)',
  })
  @IsString({ message: 'Mật khẩu phải là chuỗi' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password!: string;

  /**
   * @IsString() + @IsNotEmpty(): Validate string không rỗng
   */
  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Họ tên' })
  @IsString({ message: 'Tên phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên không được để trống' })
  name!: string;

  /**
   * @IsOptional(): Field này không bắt buộc
   * Nếu không gửi → dùng default value từ Entity ('user')
   */
  @ApiProperty({
    example: 'user',
    description: 'Vai trò',
    required: false,
    enum: ['admin', 'user'],
  })
  @IsOptional()
  @IsString()
  role?: string;
}

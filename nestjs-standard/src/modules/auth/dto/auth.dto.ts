/**
 * Auth DTOs — Định nghĩa dữ liệu đầu vào cho login/register
 *
 * class-validator decorators:
 * - @IsEmail(): Validate email format (có @ và domain)
 * - @IsString(): Phải là string
 * - @MinLength(6): Tối thiểu 6 ký tự
 * - @MaxLength(50): Tối đa 50 ký tự
 * - @IsNotEmpty(): Không được rỗng
 *
 * @ApiProperty(): Swagger docs — hiển thị field trong Swagger UI
 */
import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'Email đăng nhập' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'admin@example.com' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  @MaxLength(50)
  password: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống' })
  @MaxLength(100)
  name: string;
}

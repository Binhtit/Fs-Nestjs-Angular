import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token (ngắn hạn)' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token (dài hạn)' })
  refreshToken: string;

  @ApiProperty({ description: 'Loại token', example: 'Bearer' })
  tokenType: string;

  @ApiProperty({ description: 'Thời gian hết hạn access token', example: '15m' })
  expiresIn: string;
}

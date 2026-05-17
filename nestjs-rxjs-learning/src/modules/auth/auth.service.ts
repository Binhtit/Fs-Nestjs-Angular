/**
 * KHÁI NIỆM: Auth Service - Trung tâm xử lý Authentication
 *
 * AUTH FLOW STEP-BY-STEP:
 *
 * === ĐĂNG KÝ (Register) ===
 * 1. Client gửi { email, password, name }
 * 2. Check email chưa tồn tại
 * 3. Hash password bằng bcrypt
 * 4. Lưu user vào DB
 * 5. Tạo access + refresh token
 * 6. Lưu refresh token (hashed) vào DB
 * 7. Return tokens cho client
 *
 * === ĐĂNG NHẬP (Login) ===
 * 1. Client gửi { email, password }
 * 2. LocalStrategy extract credentials
 * 3. validateUser(): Tìm user theo email, compare password bằng bcrypt
 * 4. Nếu đúng → tạo tokens, lưu refresh token
 * 5. Return tokens
 *
 * === TRUY CẬP API (Protected Request) ===
 * 1. Client gửi header: Authorization: Bearer <access_token>
 * 2. JwtAuthGuard → JwtStrategy verify token
 * 3. Nếu valid → gắn user vào request → controller xử lý
 * 4. Nếu expired → return 401
 *
 * === LÀM MỚI TOKEN (Refresh) ===
 * 1. Access token hết hạn → client gửi refresh token
 * 2. Verify refresh token (JWT verify + DB check)
 * 3. Tạo cặp token mới (rotate refresh token)
 * 4. Return tokens mới
 */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../common/constants/error-code.constant';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { TokenResponseDto } from './dto/token-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate user credentials (dùng bởi LocalStrategy)
   * Return user object nếu đúng, null nếu sai
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;

    /**
     * bcrypt.compare(): So sánh plain password với hash
     * - Tự extract salt từ hash → hash plain password → compare
     * - Timing-safe: Tránh timing attack
     */
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return null;

    const { password: _, refreshToken: __, ...result } = user;
    return result;
  }

  /** Đăng nhập: Tạo tokens cho user đã validate */
  async login(user: { id: number; email: string; role: string }): Promise<TokenResponseDto> {
    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  /** Đăng ký: Tạo user mới + tạo tokens */
  async register(dto: RegisterDto): Promise<TokenResponseDto> {
    const user = await this.usersService.create({
      email: dto.email,
      password: dto.password,
      name: dto.name,
    });
    return this.login({ id: user.id, email: user.email, role: user.role });
  }

  /**
   * Refresh tokens: Verify refresh token cũ → tạo tokens mới
   *
   * TẠI SAO rotate refresh token (tạo mới mỗi lần refresh):
   * - Nếu refresh token bị đánh cắp và sử dụng → token cũ trong DB bị thay
   * - User thật dùng token cũ → không match DB → detect token theft
   */
  async refreshTokens(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.usersService.findByEmail(payload.email);
      if (!user || !user.refreshToken) {
        throw new Error('Invalid');
      }

      /** Compare stored refresh token */
      const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!isValid) {
        throw new Error('Invalid');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      await this.storeRefreshToken(user.id, tokens.refreshToken);
      return tokens;
    } catch {
      throw BusinessException.unauthorized(
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID.code,
        ERROR_CODES.AUTH_REFRESH_TOKEN_INVALID.message,
      );
    }
  }

  /** Đăng xuất: Xóa refresh token khỏi DB */
  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken(userId, null);
  }

  /** Tạo cặp access + refresh token */
  private async generateTokens(user: {
    id: number;
    email: string;
    role: string;
  }): Promise<TokenResponseDto> {
    /**
     * JWT Payload convention:
     * - sub (subject): User ID
     * - email: Để identify nhanh
     * - role: Để authorization không cần query DB
     */
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessExpiration = this.configService.get<string>('jwt.accessExpiration') ?? '15m';
    const secret = this.configService.get<string>('jwt.secret', 'default-secret');
    const refreshSecret = this.configService.get<string>('jwt.refreshSecret', 'default-refresh');
    const refreshExpiration = this.configService.get<string>('jwt.refreshExpiration') ?? '7d';

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret,
        expiresIn: accessExpiration as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiration as any,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: accessExpiration,
    };
  }

  /** Lưu hashed refresh token vào DB */
  private async storeRefreshToken(userId: number, token: string): Promise<void> {
    const hashed = await bcrypt.hash(token, 10);
    await this.usersService.updateRefreshToken(userId, hashed);
  }
}

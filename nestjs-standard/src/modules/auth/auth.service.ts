/**
 * KHÁI NIỆM: Auth Service — Xử lý logic đăng nhập/đăng ký
 *
 * STANDARD MVC PATTERN:
 * Controller → Service → Database (Prisma)
 *
 * SO SÁNH VỚI DDD PROJECT:
 * - DDD: Controller → CommandBus → Handler → Domain Entity → Repository
 * - MVC: Controller → Service → Prisma (trực tiếp) ← ĐƠN GIẢN HƠN NHIỀU
 *
 * BCRYPT:
 * - hash(): Mã hóa password trước khi lưu DB
 * - compare(): So sánh password người dùng nhập với hash trong DB
 * - Sử dụng salt rounds = 10 (chuẩn industry)
 *
 * JWT TOKEN:
 * - accessToken: Ngắn hạn (15 phút), dùng cho mọi API request
 * - refreshToken: Dài hạn (7 ngày), dùng để lấy accessToken mới
 *
 * LỖI PHỔ BIẾN:
 * - Lưu plaintext password → lộ hết nếu DB bị hack
 * - JWT secret quá đơn giản → dễ brute force
 * - Không có refresh token → user phải login lại mỗi 15 phút
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  /**
   * Constructor Injection — cách DI chuẩn trong NestJS
   *
   * PrismaService: Query database
   * JwtService: Sign/verify JWT tokens
   *
   * NestJS tự động tạo instance và inject vào constructor
   * (Inversion of Control — IoC)
   */
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Đăng ký tài khoản mới
   *
   * FLOW:
   * 1. Check email đã tồn tại chưa → 409 Conflict
   * 2. Hash password bằng bcrypt
   * 3. Tạo user trong DB
   * 4. Generate JWT tokens
   * 5. Return tokens
   */
  async register(dto: RegisterDto) {
    /** Check email trùng — Prisma findUnique tìm theo @unique field */
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    /**
     * bcrypt.hash(password, saltRounds):
     * - Salt = random string thêm vào password TRƯỚC KHI hash
     * - Cùng password → hash KHÁC nhau (vì salt khác)
     * - Chống rainbow table attack
     * - saltRounds = 10: cân bằng bảo mật vs tốc độ
     */
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    /** Prisma create: Insert 1 row vào bảng users */
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        role: 'READER', // Mặc định: READER (không tự gán ADMIN)
      },
    });

    this.logger.log(`Đăng ký thành công: ${user.email}`);

    /** Generate tokens và return */
    return this.generateTokens(user);
  }

  /**
   * Đăng nhập
   *
   * FLOW:
   * 1. Tìm user theo email
   * 2. So sánh password → bcrypt.compare()
   * 3. Nếu đúng → generate tokens
   * 4. Nếu sai → 401 Unauthorized
   */
  async login(dto: LoginDto) {
    /** Tìm user — nếu không có → throw generic error (không lộ "email không tồn tại") */
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      /**
       * BẢO MẬT: Trả message chung "Email hoặc mật khẩu không đúng"
       * Không trả "Email không tồn tại" → attacker biết email nào có trong hệ thống
       */
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    /**
     * bcrypt.compare(plaintext, hash):
     * - Tự extract salt từ hash → hash plaintext → so sánh
     * - Return true/false
     */
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }

    this.logger.log(`Đăng nhập thành công: ${user.email}`);

    return this.generateTokens(user);
  }

  /**
   * Refresh token — Lấy access token mới từ refresh token
   *
   * TẠI SAO cần refresh:
   * - Access token hết hạn sau 15 phút
   * - User không muốn login lại
   * - Refresh token dùng để lấy access token mới
   */
  async refreshTokens(refreshToken: string) {
    try {
      /**
       * Verify refresh token — truyền JwtPayload làm type generic để có typing đầy đủ
       * jwtService.verify<T>(): NestJS JWT hỗ trợ generic → không cần `as` cast
       * → TypeScript biết payload có { sub, email, role } → không báo lỗi any
       */
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'blog-refresh-secret',
      });

      /** Tìm user → đảm bảo user vẫn tồn tại */
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User không tồn tại');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  /**
   * Generate access + refresh tokens
   *
   * JWT PAYLOAD CONVENTION:
   * - sub: Subject (user ID) — chuẩn JWT RFC 7519
   * - email, role: Custom claims
   *
   * THỜI GIAN HẾT HẠN:
   * - accessToken: 15m (ngắn → bảo mật cao)
   * - refreshToken: 7d (dài → UX tốt hơn)
   */
  private generateTokens(user: { id: number; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, {
        secret: process.env.JWT_REFRESH_SECRET || 'blog-refresh-secret',
        expiresIn: '7d',
      }),
      tokenType: 'Bearer',
      expiresIn: '15m',
    };
  }
}

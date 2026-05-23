/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * UNIT TEST: AuthService
 *
 * KHÁI NIỆM UNIT TEST:
 * - Test 1 class/function trong isolation (cô lập)
 * - Mock tất cả dependencies → test LOGIC của class, không test dependency
 * - Nhanh, không cần DB, không cần network
 *
 * SO SÁNH TEST TYPES:
 * ┌──────────────────┬──────────────────┬──────────────────────────────────┐
 * │                  │ Unit Test        │ Integration/E2E Test             │
 * ├──────────────────┼──────────────────┼──────────────────────────────────┤
 * │ Dependencies     │ Mocked           │ Real (DB, HTTP server)           │
 * │ Tốc độ           │ ~ms              │ ~seconds                         │
 * │ Môi trường       │ Không cần gì     │ Cần DB, env vars                 │
 * │ Test gì          │ Logic            │ Toàn bộ flow (HTTP → DB → HTTP)  │
 * │ Khi nào dùng     │ Business logic   │ Happy path + auth flow           │
 * └──────────────────┴──────────────────┴──────────────────────────────────┘
 *
 * @nestjs/testing:
 * - createTestingModule(): Tạo NestJS module thu nhỏ chỉ cho test
 * - Không cần khởi động full application
 * - Override providers bằng mock objects
 *
 * JEST MOCK PATTERN:
 * - jest.fn(): Tạo mock function (không làm gì, trả undefined)
 * - mockResolvedValue(value): Khi await → trả value
 * - mockRejectedValue(error): Khi await → throw error
 * - jest.spyOn(): Wrap function thật để theo dõi calls
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * jest.mock('bcrypt') — Mock toàn bộ module bcrypt
 *
 * TẠI SAO không dùng jest.spyOn(bcrypt, 'hash'):
 * - bcrypt xuất hàm qua module.exports (CommonJS)
 * - Một số properties của bcrypt là non-configurable → không thể spy
 * - jest.mock() hoạt động tốt hơn: mock toàn bộ module ngay từ đầu
 *
 * Sau khi jest.mock():
 * - bcrypt.hash = jest.fn() (mock function)
 * - (bcrypt.hash as jest.Mock).mockResolvedValue('hashed') → mock return value
 *
 * TẠI SAO đặt jest.mock() ở TOP LEVEL (không trong beforeEach):
 * - Jest hoist jest.mock() calls lên trên tất cả imports (module factory hoisting)
 * - Phải ở top level để có tác dụng trước khi module được load
 */
jest.mock('bcrypt');

/**
 * Mock PrismaService
 *
 * Không cần DB thật → mock toàn bộ Prisma client
 * jest.fn() mặc định trả undefined → override trong từng test
 *
 * TẠI SAO mock Prisma (không dùng test DB):
 * - Test DB cần setup, seed, cleanup → chậm
 * - Unit test chỉ test SERVICE logic, không test DB behavior
 * - Nếu muốn test DB → dùng integration test với test DB thật
 */
const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

/**
 * Mock JwtService
 *
 * JwtService.sign() thật cần JWT_SECRET env → không phù hợp unit test
 * → Mock trả string giả "mock-token"
 */
const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-access-token'),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  /**
   * beforeEach: Chạy TRƯỚC MỖI test case
   *
   * createTestingModule(): Tạo NestJS testing module
   * - providers: Danh sách providers của module test
   * - Dùng useValue thay vì useClass để inject mock objects
   *
   * TẠI SAO tạo lại module trước mỗi test:
   * - Đảm bảo state sạch giữa các test
   * - Test trước không ảnh hưởng test sau
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    /**
     * Reset tất cả mock sau mỗi test
     * → Đảm bảo mockResolvedValue từ test trước không ảnh hưởng test sau
     */
    jest.clearAllMocks();
  });

  /** Kiểm tra service được tạo thành công */
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // TEST: register()
  // =========================================================================
  describe('register()', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    /**
     * Happy path: Đăng ký thành công
     *
     * SETUP:
     * - user.findUnique → null (email chưa tồn tại)
     * - user.create → user object
     * - bcrypt.hash → mocked (tránh tốn CPU)
     *
     * EXPECT:
     * - Return object có accessToken và refreshToken
     * - findUnique được gọi 1 lần với đúng email
     * - create được gọi với password đã hash
     */
    it('should register a new user and return tokens', async () => {
      const createdUser = {
        id: 1,
        email: registerDto.email,
        password: 'hashed-password',
        name: registerDto.name,
        role: 'READER',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);

      /**
       * Mock bcrypt.hash — trả 'hashed-password' thay vì chạy thật
       *
       * Tại sao mock bcrypt:
       * - bcrypt.hash() với 10 rounds tốn ~100ms
       * - Unit test phải chạy nhanh
       * - Chúng ta không test bcrypt logic → mock là đúng
       *
       * Sử dụng (bcrypt.hash as jest.Mock) vì jest.mock('bcrypt')
       * đã thay thế tất cả exports bằng jest.fn()
       */
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          email: registerDto.email,
          password: 'hashed-password',
          role: 'READER',
        }),
      });
    });

    /**
     * Error case: Email đã tồn tại → 409 Conflict
     *
     * SETUP: findUnique trả existing user (khác null)
     * EXPECT: throw ConflictException
     *
     * rejects.toThrow(): Test async function throw exception
     */
    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );

      /** Đảm bảo không tạo user mới khi email trùng */
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // TEST: login()
  // =========================================================================
  describe('login()', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const existingUser = {
      id: 1,
      email: loginDto.email,
      password: 'hashed-password',
      name: 'Test User',
      role: 'READER',
    };

    /**
     * Happy path: Login thành công
     *
     * SETUP:
     * - findUnique → user tìm thấy
     * - bcrypt.compare → true (password đúng)
     *
     * EXPECT: Return tokens
     */
    it('should login successfully and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });

    /**
     * Error case: Email không tồn tại
     *
     * BẢO MẬT: Cả 2 case (email sai, password sai) đều throw cùng message
     * → Attacker không biết email nào đang active trong hệ thống
     */
    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Error case: Password sai
     *
     * SETUP: findUnique → user tìm thấy, nhưng bcrypt.compare → false
     */
    it('should throw UnauthorizedException if password is wrong', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // =========================================================================
  // TEST: refreshTokens()
  // =========================================================================
  describe('refreshTokens()', () => {
    /**
     * Happy path: Refresh token hợp lệ
     *
     * SETUP:
     * - jwtService.verify → payload { sub: 1, email: '...', role: '...' }
     * - findUnique → user tìm thấy
     */
    it('should return new tokens when refresh token is valid', async () => {
      const payload = { sub: 1, email: 'test@example.com', role: 'READER' };
      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: payload.email,
        role: payload.role,
      });

      const result = await service.refreshTokens('valid-refresh-token');

      expect(result).toHaveProperty('accessToken');
    });

    /**
     * Error case: Refresh token không hợp lệ (đã hết hạn, bị giả mạo)
     *
     * SETUP: jwtService.verify → throw Error (token invalid)
     * EXPECT: throw UnauthorizedException
     *
     * try-catch trong service bắt error → throw UnauthorizedException
     */
    it('should throw UnauthorizedException if refresh token is invalid', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('Token expired');
      });

      await expect(service.refreshTokens('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    /**
     * Error case: Token hợp lệ nhưng user đã bị xóa khỏi DB
     */
    it('should throw UnauthorizedException if user no longer exists', async () => {
      const payload = { sub: 999, email: 'deleted@example.com', role: 'READER' };
      mockJwtService.verify.mockReturnValue(payload);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('valid-but-stale-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});

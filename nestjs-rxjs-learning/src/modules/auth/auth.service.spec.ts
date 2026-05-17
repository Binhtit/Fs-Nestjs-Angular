/**
 * KHÁI NIỆM: Unit Test cho Auth Service
 *
 * Test auth service cần mock:
 * - UsersService (findByEmail, create, updateRefreshToken)
 * - JwtService (signAsync, verify)
 * - ConfigService (get)
 * - bcrypt (hash, compare)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

/** Mock UsersService */
const mockUsersService = () => ({
  findByEmail: jest.fn(),
  create: jest.fn(),
  updateRefreshToken: jest.fn(),
});

/** Mock JwtService */
const mockJwtService = () => ({
  signAsync: jest.fn(),
  verify: jest.fn(),
});

/** Mock ConfigService */
const mockConfigService = () => ({
  get: jest.fn((key: string, defaultVal?: string) => {
    const config: Record<string, string> = {
      'jwt.secret': 'test-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiration': '15m',
      'jwt.refreshExpiration': '7d',
    };
    return config[key] ?? defaultVal;
  }),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useFactory: mockUsersService },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: ConfigService, useFactory: mockConfigService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  /**
   * TEST: validateUser()
   * - Tìm user theo email
   * - So sánh password với bcrypt
   * - Return user object (không có password) nếu đúng
   */
  describe('validateUser', () => {
    it('should return user when credentials are valid', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = {
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
        name: 'Test',
        role: 'user',
        refreshToken: null,
      };

      usersService.findByEmail!.mockResolvedValue(mockUser as any);

      const result = await authService.validateUser('test@test.com', 'password123');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('refreshToken');
      expect(result!.email).toBe('test@test.com');
    });

    it('should return null when user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      const result = await authService.validateUser('wrong@test.com', 'password');
      expect(result).toBeNull();
    });

    it('should return null when password is wrong', async () => {
      const hashedPassword = await bcrypt.hash('correct-password', 10);
      usersService.findByEmail!.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        password: hashedPassword,
      } as any);

      const result = await authService.validateUser('test@test.com', 'wrong-password');
      expect(result).toBeNull();
    });
  });

  /**
   * TEST: login()
   * - Generate access + refresh tokens
   * - Store hashed refresh token in DB
   * - Return TokenResponseDto
   */
  describe('login', () => {
    it('should return access and refresh tokens', async () => {
      jwtService.signAsync!
        .mockResolvedValueOnce('access-token-123')
        .mockResolvedValueOnce('refresh-token-456');
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      const user = { id: 1, email: 'test@test.com', role: 'user' };
      const result = await authService.login(user);

      expect(result).toEqual({
        accessToken: 'access-token-123',
        refreshToken: 'refresh-token-456',
        tokenType: 'Bearer',
        expiresIn: '15m',
      });

      // Verify refresh token was stored (hashed)
      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(
        1,
        expect.any(String), // hashed token
      );
    });
  });

  /**
   * TEST: logout()
   * - Clear refresh token từ DB
   */
  describe('logout', () => {
    it('should clear refresh token', async () => {
      usersService.updateRefreshToken!.mockResolvedValue(undefined);

      await authService.logout(1);

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(1, null);
    });
  });
});

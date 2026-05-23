/**
 * UNIT TEST: JwtAuthGuard
 *
 * GUARD TEST PATTERN:
 * - Guard có canActivate(context) → return boolean hoặc throw
 * - Test các case: @Public() route, authenticated request, unauthenticated request
 *
 * MOCK ExecutionContext:
 * - Guard dùng ExecutionContext để truy cập request/response
 * - createMockContext(): Tạo ExecutionContext giả với các method cần thiết
 *
 * MOCK Reflector:
 * - Guard dùng Reflector.getAllAndOverride() để đọc metadata
 * - Ví dụ: kiểm tra route có @Public() decorator không
 */
import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Helper: Tạo mock ExecutionContext
 *
 * ExecutionContext trong NestJS là object phức tạp chứa HTTP request/response
 * → Tạo mock đơn giản với chỉ các method guard cần dùng
 *
 * getHandler(): Trả về route handler (method của controller)
 * getClass(): Trả về controller class
 * switchToHttp().getRequest(): Trả về HTTP request object
 */
function createMockContext(isAuthenticated = true): ExecutionContext {
  const mockUser = isAuthenticated
    ? { id: 1, email: 'test@example.com', role: 'READER' }
    : undefined;

  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: mockUser,
        headers: {
          authorization: isAuthenticated ? 'Bearer mock-token' : undefined,
        },
      }),
    }),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        /**
         * Reflector: NestJS utility để đọc metadata từ decorators
         * - Cung cấp bởi @nestjs/core (không cần mock phức tạp)
         * - Dùng reflect-metadata API bên dưới
         */
        Reflector,
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  /**
   * Test: Route có @Public() → bypass JWT guard
   *
   * SETUP: reflector.getAllAndOverride → true (IS_PUBLIC_KEY found)
   * EXPECT: canActivate trả true mà không check token
   *
   * TẠI SAO @Public() quan trọng:
   * - Global JWT guard protect tất cả routes
   * - Một số route cần public (login, register, list posts)
   * - @Public() metadata → guard bỏ qua → không cần token
   */
  it('should allow access to routes decorated with @Public()', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    const context = createMockContext(false); // Không có token
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  /**
   * Test: Route không có @Public() + request có user (đã authenticated)
   *
   * Trong thực tế, Passport strategy đã verify token và attach user vào request
   * Sau đó JwtAuthGuard gọi super.canActivate() → Passport xử lý
   *
   * NOTE: Test này simplified vì super.canActivate() (AuthGuard) cần
   * full Passport setup. Trong thực tế nên dùng integration test cho flow này.
   */
  it('should call super.canActivate() for non-public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    /**
     * Spy on prototype của AuthGuard để kiểm tra guard delegate cho Passport
     * → Đây là pattern verify "guard gọi đúng chỗ"
     * → Không cần test Passport internals (đó là Passport's job)
     */
    const superSpy = jest
      .spyOn(Object.getPrototypeOf(JwtAuthGuard.prototype), 'canActivate')
      .mockResolvedValue(true);

    const context = createMockContext(true);
    void guard.canActivate(context);

    expect(superSpy).toHaveBeenCalledWith(context);
  });
});

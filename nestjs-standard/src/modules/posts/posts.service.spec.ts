/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * UNIT TEST: PostsService
 *
 * TEST SCOPE:
 * - findAll(): Pagination + filter
 * - create(): Tạo post + generate slug
 * - update(): Ownership check (chỉ owner/admin được sửa)
 * - remove(): Soft delete
 * - publishPost(): $transaction
 *
 * MOCK STRATEGY:
 * - Mock toàn bộ PrismaService → không cần DB
 * - mockReturnValue vs mockResolvedValue:
 *   - mockReturnValue: hàm sync
 *   - mockResolvedValue: hàm async (Promise.resolve(value))
 *
 * JEST MATCHERS:
 * - expect(x).toBe(y): Strict equality (===)
 * - expect(x).toEqual(y): Deep equality (object structure)
 * - expect(x).toHaveProperty(key): Check object has property
 * - expect(fn).toHaveBeenCalledWith(args): Check mock called with args
 * - expect(fn).rejects.toThrow(Error): Check async throws
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Factory: Tạo mock post object
 *
 * PATTERN: Factory function thay vì object literal
 * → Dễ override từng field trong test: { ...mockPost(), authorId: 2 }
 * → Tránh mutation giữa các test
 */
function mockPost(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    title: 'Test Post',
    slug: 'test-post-abc123',
    content: 'Test content',
    excerpt: null,
    thumbnail: null,
    status: 'DRAFT',
    viewCount: 0,
    authorId: 1,
    categoryId: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  };
}

const mockPrismaService = {
  post: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  postTag: {
    deleteMany: jest.fn(),
  },
  /**
   * $transaction mock:
   * - Trong tests, $transaction([op1, op2]) nhận mảng Promises
   * - Mock: resolve tất cả promises và trả mảng kết quả
   * - Mô phỏng đúng behavior của $transaction array pattern
   */
  $transaction: jest.fn().mockImplementation(
    (operations: Promise<unknown>[]) => Promise.all(operations),
  ),
};

describe('PostsService', () => {
  let service: PostsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // =========================================================================
  // TEST: findAll()
  // =========================================================================
  describe('findAll()', () => {
    /**
     * Test: Lấy danh sách posts với pagination mặc định
     *
     * EXPECT:
     * - Trả về object có data + pagination
     * - pagination.totalPages tính đúng
     * - findMany được gọi với skip/take đúng
     */
    it('should return paginated posts with default params', async () => {
      const posts = [mockPost(), mockPost({ id: 2 })];
      mockPrismaService.post.findMany.mockResolvedValue(posts);
      mockPrismaService.post.count.mockResolvedValue(2);

      const result = await service.findAll({});

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.total).toBe(2);
      expect(result.pagination.totalPages).toBe(1);

      /**
       * Verify findMany được gọi với đúng args
       * expect.objectContaining: Match subset của object
       * → Không cần match toàn bộ (skip undefined fields)
       */
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,   // (page=1 - 1) * limit=10 = 0
          take: 10,  // default limit
        }),
      );
    });

    /**
     * Test: Filter theo status
     *
     * EXPECT: where.status = 'DRAFT' (không dùng default 'PUBLISHED')
     */
    it('should filter posts by status', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      await service.findAll({ status: 'DRAFT' });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'DRAFT' }),
        }),
      );
    });

    /**
     * Test: Default status = 'PUBLISHED' khi không truyền status
     *
     * Đây là test cho bug đã fix: trước đây không set default
     */
    it('should default to PUBLISHED status when no status provided', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      await service.findAll({});

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'PUBLISHED' }),
        }),
      );
    });
  });

  // =========================================================================
  // TEST: create()
  // =========================================================================
  describe('create()', () => {
    const createDto = {
      title: 'Hello World',
      content: 'Post content here',
    };

    /**
     * Test: Tạo post thành công
     *
     * SLUG GENERATION:
     * - "Hello World" → "hello-world-<timestamp>"
     * - Không test exact slug (timestamp thay đổi)
     * - Test: create được gọi với slug có prefix "hello-world-"
     */
    it('should create a post and generate a slug', async () => {
      const expectedPost = mockPost({ title: createDto.title });
      mockPrismaService.post.create.mockResolvedValue(expectedPost);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(expectedPost);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            title: createDto.title,
            slug: expect.stringMatching(/^hello-world-/),
            authorId: 1,
          }),
        }),
      );
    });
  });

  // =========================================================================
  // TEST: update() — OWNERSHIP CHECK
  // =========================================================================
  describe('update()', () => {
    const updateDto = { title: 'Updated Title' };

    /**
     * Test: Owner update post thành công
     *
     * authorId === userId → cho phép sửa
     */
    it('should allow the post owner to update', async () => {
      const post = mockPost({ authorId: 1, status: 'DRAFT' });
      const updatedPost = mockPost({ title: 'Updated Title' });

      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue(updatedPost);

      const result = await service.update(1, updateDto, 1, 'READER');

      expect(result).toEqual(updatedPost);
    });

    /**
     * Test: Admin update post của người khác
     *
     * authorId !== userId nhưng role === 'ADMIN' → vẫn cho phép
     */
    it('should allow ADMIN to update any post', async () => {
      const post = mockPost({ authorId: 2 }); // Post của user 2
      const updatedPost = mockPost({ title: 'Updated Title' });

      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue(updatedPost);

      /** Admin (userId=1) update post của user 2 */
      const result = await service.update(1, updateDto, 1, 'ADMIN');

      expect(result).toEqual(updatedPost);
    });

    /**
     * Test: Non-owner không phải Admin → 403 Forbidden
     *
     * ĐÂY LÀ OWNERSHIP CHECK QUAN TRỌNG NHẤT
     * authorId=2, userId=1, role='READER' → throw ForbiddenException
     */
    it('should throw ForbiddenException if user is not owner or admin', async () => {
      const post = mockPost({ authorId: 2 }); // Post của user 2
      mockPrismaService.post.findUnique.mockResolvedValue(post);

      /** User 1 (READER) cố update post của user 2 */
      await expect(
        service.update(1, updateDto, 1, 'READER'),
      ).rejects.toThrow(ForbiddenException);

      /** Đảm bảo không cập nhật vào DB */
      expect(mockPrismaService.post.update).not.toHaveBeenCalled();
    });

    /**
     * Test: Post không tồn tại → 404 Not Found
     */
    it('should throw NotFoundException if post does not exist', async () => {
      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.update(999, updateDto, 1, 'ADMIN'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // =========================================================================
  // TEST: publishPost() — DEMO $transaction
  // =========================================================================
  describe('publishPost()', () => {
    /**
     * Test: Owner publish bài viết thành công
     *
     * VERIFY:
     * - $transaction được gọi (đây là điểm quan trọng của demo)
     * - post.update bên trong transaction có data đúng
     */
    it('should publish a post using $transaction', async () => {
      const post = mockPost({ authorId: 1, status: 'DRAFT' });
      const publishedPost = mockPost({ status: 'PUBLISHED', publishedAt: new Date() });

      mockPrismaService.post.findUnique.mockResolvedValue(post);
      mockPrismaService.post.update.mockResolvedValue(publishedPost);

      const result = await service.publishPost(1, 1, 'READER');

      expect(result).toEqual(publishedPost);
      /** $transaction phải được gọi (đây là test chính) */
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    /**
     * Test: Non-owner không thể publish
     */
    it('should throw ForbiddenException for non-owner', async () => {
      const post = mockPost({ authorId: 2 });
      mockPrismaService.post.findUnique.mockResolvedValue(post);

      await expect(service.publishPost(1, 1, 'READER')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});

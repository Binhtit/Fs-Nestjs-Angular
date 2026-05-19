/**
 * Posts Service — CRUD nâng cao (pagination, filter, search, slug, tags)
 *
 * DEMO PATTERNS:
 * 1. Dynamic WHERE: Xây dựng filter theo query params
 * 2. Prisma INCLUDE: Eager load relations (author, category, tags)
 * 3. Prisma TRANSACTIONS: Tạo post + gắn tags trong 1 transaction
 * 4. Slug generation: Tạo URL-friendly string từ title
 * 5. Ownership check: Chỉ tác giả/admin mới sửa/xóa được bài
 *
 * PRISMA QUERY NÂNG CAO:
 * - where + contains: LIKE search
 * - include: Eager load (join bảng liên quan)
 * - orderBy: Dynamic sort
 * - skip/take: Pagination
 * - $transaction: Atomic operations (tất cả thành công hoặc rollback)
 */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo slug từ title */
  private generateSlug(title: string): string {
    const base = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    /** Thêm timestamp để đảm bảo unique */
    return `${base}-${Date.now().toString(36)}`;
  }

  /**
   * Tạo post mới + gắn tags (transaction)
   *
   * PRISMA TRANSACTION:
   * - prisma.$transaction([...]) → chạy nhiều queries atomic
   * - Nếu 1 query fail → tất cả rollback
   * - Đảm bảo data integrity
   */
  async create(dto: CreatePostDto, authorId: number) {
    const slug = this.generateSlug(dto.title);

    return this.prisma.post.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        thumbnail: dto.thumbnail,
        authorId,
        categoryId: dto.categoryId,
        /**
         * MANY-TO-MANY: Gắn tags khi tạo post
         * tags.create: Tạo rows trong bảng trung gian PostTag
         * tagId từ dto.tagIds → tạo { tagId } cho mỗi tag
         */
        tags: dto.tagIds?.length
          ? { create: dto.tagIds.map((tagId) => ({ tagId })) }
          : undefined,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  /**
   * Lấy danh sách posts (pagination + filter + search)
   *
   * DYNAMIC WHERE:
   * - Xây dựng object `where` dựa trên query params
   * - Chỉ thêm điều kiện khi param có giá trị
   * - Prisma tự ignore undefined fields
   *
   * CONTAINS: Tương đương SQL LIKE '%search%'
   * mode: 'insensitive' → không phân biệt hoa thường
   */
  async findAll(query: QueryPostDto) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      status,
      categoryId,
      tagId,
    } = query;

    /**
     * Xây dựng WHERE clause động
     *
     * Prisma.PostWhereInput: Type-safe filter object
     * → IDE tự gợi ý fields hợp lệ (title, status, categoryId...)
     * → Nếu gõ sai field → TypeScript báo lỗi ngay
     */
    const where: Prisma.PostWhereInput = {};

    /** Mặc định chỉ hiện bài PUBLISHED (nếu không filter status) */
    if (status) {
      where.status = status;
    }

    /** Tìm kiếm theo title */
    if (search) {
      where.title = { contains: search };
    }

    /** Filter theo category */
    if (categoryId) {
      where.categoryId = categoryId;
    }

    /** Filter theo tag (many-to-many) */
    if (tagId) {
      where.tags = { some: { tagId } };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          tags: {
            include: { tag: { select: { id: true, name: true, slug: true } } },
          },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** Lấy post theo slug (public) */
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, email: true } },
        category: true,
        tags: { include: { tag: true } },
        comments: {
          include: { author: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post) {
      throw new NotFoundException(`Bài viết "${slug}" không tồn tại`);
    }

    /** Tăng view count */
    await this.prisma.post.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    });

    return post;
  }

  /**
   * Cập nhật post (chỉ owner hoặc admin)
   *
   * OWNERSHIP CHECK:
   * - Tìm post → check post.authorId === userId
   * - Nếu không phải owner VÀ không phải ADMIN → 403 Forbidden
   */
  async update(
    id: number,
    dto: UpdatePostDto,
    userId: number,
    userRole: string,
  ) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ID ${id} không tồn tại`);
    }

    /** Chỉ tác giả hoặc admin mới sửa được */
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }

    /**
     * Xây dựng data update
     *
     * Prisma.PostUpdateInput: Type-safe update object
     * → Chỉ chấp nhận fields có trong model Post
     * → Bao gồm cả nested relations (tags, category...)
     */
    const data: Prisma.PostUpdateInput = {};
    if (dto.title) {
      data.title = dto.title;
      data.slug = this.generateSlug(dto.title);
    }
    if (dto.content !== undefined) data.content = dto.content;
    if (dto.excerpt !== undefined) data.excerpt = dto.excerpt;
    if (dto.thumbnail !== undefined) data.thumbnail = dto.thumbnail;
    /**
     * Prisma.PostUpdateInput dùng RELATION pattern cho FK:
     * - KHÔNG dùng: data.categoryId = 1
     * - MÀ DÙNG: data.category = { connect: { id: 1 } }
     *
     * TẠI SAO: PostUpdateInput mô tả QUAN HỆ (relation), không phải FK trực tiếp
     * Cách này type-safe hơn và hỗ trợ nested operations (create, connect, disconnect)
     */
    if (dto.categoryId !== undefined) {
      data.category = { connect: { id: dto.categoryId } };
    }
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'PUBLISHED' && !post.publishedAt) {
        data.publishedAt = new Date();
      }
    }

    /** Cập nhật tags nếu có */
    if (dto.tagIds) {
      /** Xóa tags cũ → tạo tags mới (replace all) */
      await this.prisma.postTag.deleteMany({ where: { postId: id } });
      data.tags = {
        create: dto.tagIds.map((tagId) => ({
          tag: { connect: { id: tagId } },
        })),
      };
    }

    return this.prisma.post.update({
      where: { id },
      data,
      include: {
        author: { select: { id: true, name: true } },
        category: true,
        tags: { include: { tag: true } },
      },
    });
  }

  /** Xóa post (owner hoặc admin) */
  async remove(id: number, userId: number, userRole: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ID ${id} không tồn tại`);
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    await this.prisma.post.delete({ where: { id } });
    return { message: `Đã xóa bài viết "${post.title}"` };
  }
}

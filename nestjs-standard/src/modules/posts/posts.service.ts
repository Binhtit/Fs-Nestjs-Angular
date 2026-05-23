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
   * Tạo post mới + gắn tags (nested write — atomic by default)
   *
   * PRISMA NESTED WRITE vs $TRANSACTION:
   * - Nested write (dùng ở đây): Tạo post + tags trong 1 lệnh prisma.post.create()
   *   → Prisma tự wrap thành 1 SQL transaction ngầm định
   *   → Nếu tạo post fail → tags cũng không được tạo (atomic)
   *
   * - $transaction([...]) (dùng khi cần): Gộp NHIỀU Prisma calls thủ công
   *   Ví dụ: await prisma.$transaction([
   *     prisma.post.create({ data: postData }),
   *     prisma.user.update({ where: { id }, data: { postCount: { increment: 1 } } }),
   *   ]);
   *   → Dùng khi cần đảm bảo nhiều operations khác nhau thành công cùng lúc
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
         * Cách 1 (dùng ở đây): { tagId } — gán FK trực tiếp vào bảng trung gian PostTag
         * Cách 2 (dùng trong update): { tag: { connect: { id } } } — kết nối qua relation
         * → Cả hai tương đương nhau, Cách 1 ngắn gọn hơn khi đã có ID sẵn
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
     *
     * SOFT DELETE: Luôn filter deletedAt: null để không trả posts đã "xóa"
     * → Prisma v7 bỏ $use() middleware → phải filter thủ công
     */
    const where: Prisma.PostWhereInput = { deletedAt: null };

    /**
     * Mặc định chỉ hiện bài PUBLISHED (nếu client không truyền status)
     * → Người dùng chưa đăng nhập gọi GET /posts sẽ không thấy bài DRAFT/ARCHIVED
     * → Nếu muốn xem tất cả (ví dụ admin): truyền ?status=DRAFT hoặc ?status=ARCHIVED
     *
     * Dùng ?? (nullish coalescing) thay vì || vì:
     * - || coi '' (empty string) là falsy → bị thay bằng 'PUBLISHED' (không mong muốn)
     * - ?? chỉ thay khi giá trị là null hoặc undefined
     */
    where.status = status ?? 'PUBLISHED';

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

  /** Lấy post theo slug (public) — chỉ trả post chưa bị soft delete */
  async findBySlug(slug: string) {
    const post = await this.prisma.post.findUnique({
      where: { slug, deletedAt: null },
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
      /** Xóa tags cũ → tạo tags mới (replace all strategy) */
      await this.prisma.postTag.deleteMany({ where: { postId: id } });
      /**
       * Cách 2: { tag: { connect: { id } } } — kết nối qua relation object
       * → Bắt buộc dùng cách này với Prisma.PostUpdateInput vì type không cho phép
       *   gán FK trực tiếp { tagId } (chỉ hợp lệ trong create nested write)
       * → Cách 1 ({ tagId } trực tiếp) dùng được khi tạo mới (trong method create)
       *   vì lúc đó Prisma biết đang tạo row mới trong bảng trung gian PostTag
       */
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

  /**
   * Publish bài viết — DEMO Prisma $transaction explicit
   *
   * TẠI SAO DÙNG $transaction Ở ĐÂY:
   * - Nested write (trong create) chỉ atomic trong 1 lệnh Prisma
   * - $transaction([...]) dùng khi cần gộp NHIỀU lệnh Prisma độc lập thành 1 unit
   *
   * PATTERN: Sequential array transaction
   * prisma.$transaction([op1, op2, op3]):
   * - op1, op2, op3 là Promise (chưa await)
   * - Prisma gom lại → chạy trong 1 SQL transaction
   * - Nếu bất kỳ op nào fail → toàn bộ rollback
   *
   * SO SÁNH với Interactive Transaction (dành cho logic phức tạp hơn):
   * prisma.$transaction(async (tx) => {
   *   const post = await tx.post.findUnique({ where: { id } });
   *   if (post.status === 'PUBLISHED') throw new Error('Already published');
   *   await tx.post.update({ ... });
   *   await tx.user.update({ ... }); // ví dụ update điểm author
   * });
   * → Interactive: có thể dùng kết quả op trước cho op sau (sequential logic)
   * → Array: tất cả ops chạy song song, không biết kết quả của nhau
   */
  async publishPost(id: number, userId: number, userRole: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ID ${id} không tồn tại`);
    }

    /** Chỉ tác giả hoặc admin mới publish được */
    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền publish bài viết này');
    }

    /**
     * $transaction([...]) — Array transaction (parallel ops)
     *
     * Op 1: Cập nhật status + publishedAt của bài viết
     * Op 2 (ví dụ): Có thể thêm bất kỳ Prisma operation nào vào đây
     *   → Ví dụ thực tế: update user stats, tạo notification, ghi audit log...
     *   → Tất cả thành công hoặc cùng rollback
     *
     * results[0] = kết quả của op đầu tiên (updated post)
     */
    const [updatedPost] = await this.prisma.$transaction([
      this.prisma.post.update({
        where: { id },
        data: {
          status: 'PUBLISHED',
          /**
           * Chỉ set publishedAt nếu chưa từng publish
           * → Tránh ghi đè thời điểm publish đầu tiên khi re-publish
           */
          publishedAt: post.publishedAt ?? new Date(),
        },
        include: {
          author: { select: { id: true, name: true } },
          category: true,
          tags: { include: { tag: true } },
        },
      }),
      // Ví dụ op thứ 2: cập nhật số lượng bài đã publish của tác giả
      // Hiện tại User model chưa có field publishedPostCount nên bỏ qua
      // this.prisma.user.update({
      //   where: { id: post.authorId },
      //   data: { publishedPostCount: { increment: 1 } },
      // }),
    ]);

    return updatedPost;
  }

  /**
   * Xóa post — SOFT DELETE
   *
   * SOFT DELETE vs HARD DELETE:
   * - Hard delete: DELETE FROM posts WHERE id = ? → mất vĩnh viễn
   * - Soft delete: UPDATE posts SET deletedAt = now() WHERE id = ?
   *   → Record vẫn còn trong DB → có thể khôi phục (undelete)
   *
   * PRISMA v7 NOTE:
   * - Prisma v5 có $use() middleware → intercept delete() → auto soft delete
   * - Prisma v7 bỏ $use() → phải gọi update() trực tiếp
   * - Service-level soft delete: explicit, dễ hiểu, dễ debug
   *
   * SAU KHI SOFT DELETE:
   * - findMany({ where: { deletedAt: null } }) sẽ không trả post này
   * - Admin có thể query { deletedAt: { not: null } } để xem posts đã xóa
   * - Undelete: update({ data: { deletedAt: null } })
   */
  async remove(id: number, userId: number, userRole: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post ID ${id} không tồn tại`);
    }

    if (post.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }

    /**
     * Soft delete: set deletedAt thay vì xóa thật
     * → Các query findMany cần tự thêm where: { deletedAt: null } để lọc
     */
    await this.prisma.post.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: `Đã xóa bài viết "${post.title}" (soft delete)` };
  }
}

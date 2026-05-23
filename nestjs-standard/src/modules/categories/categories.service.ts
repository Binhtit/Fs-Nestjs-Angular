/**
 * Categories Service — CRUD + Cache Invalidation
 *
 * ĐÂY LÀ MẪU CƠ BẢN NHẤT — copy service này khi tạo entity mới:
 * 1. Đổi tên class + entity name
 * 2. Đổi DTO types
 * 3. Thêm business logic riêng
 *
 * CACHING STRATEGY — Cache-aside (Lazy Loading):
 * - READ: CacheInterceptor tự động cache ở Controller layer
 * - WRITE: Service phải xóa cache thủ công sau khi thay đổi data
 *
 * TẠI SAO XÓA CACHE SAU KHI WRITE:
 * - Cache đang giữ version cũ của data
 * - Nếu không xóa → user vẫn thấy data cũ cho đến khi TTL hết
 * - Sau khi xóa cache → request tiếp theo sẽ query DB → cache version mới
 *
 * CACHE KEY:
 * - CacheInterceptor tự generate từ URL path
 * - GET /api/v1/categories → key dựa trên URL
 * - Phải invalidate cache này khi data thay đổi
 *
 * SLUG GENERATION:
 * - Tên: "Lập Trình Backend" → Slug: "lap-trinh-backend"
 * - Dùng cho URL: /categories/lap-trinh-backend (SEO friendly)
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    /**
     * CACHE_MANAGER: Token để inject Cache instance
     * - Cung cấp bởi CacheModule (đã register global trong AppModule)
     * - Dùng để: get, set, del cache entries thủ công
     * - Type: Cache (từ 'cache-manager')
     */
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  /**
   * Xóa toàn bộ cache sau khi thay đổi data categories
   *
   * Vấn đề: CacheInterceptor auto-generate cache key từ URL
   * → Key thực tế có thể là "/api/v1/categories" hoặc dạng hashed
   * → Cách an toàn nhất: reset() toàn bộ cache
   *
   * Production consideration:
   * - Nếu cache nhiều entities → không nên reset() toàn bộ
   * - Dùng tagged cache hoặc key pattern để invalidate selective
   * - Ví dụ với Redis: SCAN keys "categories:*" → DEL
   */
  private async invalidateCategoriesCache(): Promise<void> {
    await this.cacheManager.clear();
  }

  /**
   * Tạo slug từ tên
   * "Lập Trình Backend" → "lap-trinh-backend"
   *
   * Normalize: bỏ dấu tiếng Việt (NFD + regex)
   * Lowercase → replace non-alphanumeric → trim hyphens
   */
  private generateSlug(name: string): string {
    return name
      .normalize('NFD')                        // Tách dấu: "ệ" → "ê" + dấu nặng
      .replace(/[̀-ͯ]/g, '')          // Bỏ dấu combining characters
      .replace(/đ/g, 'd')                  // đ → d
      .replace(/Đ/g, 'D')                  // Đ → D
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')             // Thay ký tự đặc biệt bằng -
      .replace(/^-+|-+$/g, '');                // Bỏ - ở đầu/cuối
  }

  /**
   * Tạo category mới + invalidate cache
   *
   * Sau khi create → danh sách categories đã thay đổi
   * → Cache cũ chứa danh sách thiếu record mới → phải xóa
   */
  async create(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);

    /** Check trùng tên */
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Danh mục "${dto.name}" đã tồn tại`);
    }

    const result = await this.prisma.category.create({
      data: { ...dto, slug },
    });

    /** Xóa cache để request tiếp theo lấy data mới từ DB */
    await this.invalidateCategoriesCache();

    return result;
  }

  /** Lấy tất cả categories (không phân trang — thường ít data) */
  async findAll() {
    return this.prisma.category.findMany({
      include: {
        _count: { select: { posts: true } }, // Đếm số bài viết mỗi category
      },
      orderBy: { name: 'asc' },
    });
  }

  /** Lấy category theo slug */
  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { posts: true } },
      },
    });

    if (!category) {
      throw new NotFoundException(`Danh mục "${slug}" không tồn tại`);
    }

    return category;
  }

  /** Cập nhật category + invalidate cache */
  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ID ${id} không tồn tại`);
    }

    /** Prisma.CategoryUpdateInput: type-safe, chỉ chấp nhận fields hợp lệ */
    const data: Prisma.CategoryUpdateInput = { ...dto };
    if (dto.name) {
      data.slug = this.generateSlug(dto.name);
    }

    const result = await this.prisma.category.update({ where: { id }, data });

    await this.invalidateCategoriesCache();

    return result;
  }

  /** Xóa category + invalidate cache */
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ID ${id} không tồn tại`);
    }

    await this.prisma.category.delete({ where: { id } });

    await this.invalidateCategoriesCache();

    return { message: `Đã xóa danh mục "${category.name}"` };
  }
}

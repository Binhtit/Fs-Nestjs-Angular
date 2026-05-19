/**
 * Categories Service — CRUD đơn giản nhất (template cho mọi entity)
 *
 * ĐÂY LÀ MẪU CƠ BẢN NHẤT — copy service này khi tạo entity mới:
 * 1. Đổi tên class + entity name
 * 2. Đổi DTO types
 * 3. Thêm business logic riêng
 *
 * SLUG GENERATION:
 * - Tên: "Lập Trình Backend" → Slug: "lap-trinh-backend"
 * - Dùng cho URL: /categories/lap-trinh-backend (SEO friendly)
 * - Cách tạo: lowercase → replace spaces/special chars → hyphenate
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo slug từ tên
   * "Lập Trình Backend" → "lap-trinh-backend"
   *
   * Normalize: bỏ dấu tiếng Việt (NFD + regex)
   * Lowercase → replace non-alphanumeric → trim hyphens
   */
  private generateSlug(name: string): string {
    return name
      .normalize('NFD')                    // Tách dấu: "ệ" → "ê" + dấu nặng
      .replace(/[\u0300-\u036f]/g, '')      // Bỏ dấu
      .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Xử lý đ/Đ riêng
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')         // Thay ký tự đặc biệt bằng -
      .replace(/^-+|-+$/g, '');            // Bỏ - ở đầu/cuối
  }

  /** Tạo category mới */
  async create(dto: CreateCategoryDto) {
    const slug = this.generateSlug(dto.name);

    /** Check trùng tên */
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Danh mục "${dto.name}" đã tồn tại`);
    }

    return this.prisma.category.create({
      data: { ...dto, slug },
    });
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

  /** Cập nhật category */
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

    return this.prisma.category.update({ where: { id }, data });
  }

  /** Xóa category */
  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category ID ${id} không tồn tại`);
    }

    await this.prisma.category.delete({ where: { id } });
    return { message: `Đã xóa danh mục "${category.name}"` };
  }
}

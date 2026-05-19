/**
 * KHÁI NIỆM: Tags Service — CRUD cho hệ thống tag (nhãn bài viết)
 *
 * TAG vs CATEGORY:
 * ┌───────────────────┬───────────────────────────┬──────────────────────────┐
 * │                   │ Category (danh mục)       │ Tag (nhãn)               │
 * ├───────────────────┼───────────────────────────┼──────────────────────────┤
 * │ Quan hệ           │ 1 post → 1 category       │ 1 post → nhiều tags      │
 * │ DB relation       │ One-to-Many (FK)          │ Many-to-Many (bảng TG)   │
 * │ Bảng trung gian   │ Không cần                 │ PostTag (postId, tagId)  │
 * │ Ví dụ             │ "Backend", "Frontend"     │ "NestJS", "TypeScript"   │
 * │ Mục đích          │ Phân loại chính           │ Gắn nhãn bổ sung        │
 * └───────────────────┴───────────────────────────┴──────────────────────────┘
 *
 * MANY-TO-MANY TRONG PRISMA:
 * - 1 Post có nhiều Tags, 1 Tag thuộc nhiều Posts
 * - Prisma dùng "explicit many-to-many" qua model PostTag
 * - PostTag chứa: postId + tagId (composite key)
 *
 * SLUG GENERATION:
 * - Giống CategoryService — tạo URL-friendly string từ tên
 * - "TypeScript" → "typescript"
 * - "Lập Trình Web" → "lap-trinh-web"
 *
 * LỖI PHỔ BIẾN:
 * - Tạo tag trùng tên → Prisma unique constraint error → cần check trước
 * - Xóa tag đang được dùng → cần cascade delete hoặc check trước
 */
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTagDto } from './dto/tag.dto';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo slug từ tên tag
   *
   * CÙNG LOGIC với CategoriesService.generateSlug()
   * → Production: nên extract ra shared helper để tránh duplicate
   *
   * FLOW: "NestJS Framework" → normalize → lowercase → replace → "nestjs-framework"
   */
  private generateSlug(name: string): string {
    return name
      .normalize('NFD') // Tách dấu tiếng Việt
      .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D') // Xử lý đ/Đ riêng
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Thay ký tự đặc biệt bằng -
      .replace(/^-+|-+$/g, ''); // Bỏ - ở đầu/cuối
  }

  /**
   * Tạo tag mới
   *
   * FLOW:
   * 1. Check tên tag đã tồn tại chưa → 409 Conflict
   * 2. Generate slug từ tên
   * 3. Insert vào DB
   *
   * findUnique({ where: { name } }):
   * - name là @unique field trong Prisma schema
   * - Tìm chính xác 1 record → null nếu không có
   */
  async create(dto: CreateTagDto) {
    const existing = await this.prisma.tag.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Tag "${dto.name}" đã tồn tại`);
    }

    return this.prisma.tag.create({
      data: { name: dto.name, slug: this.generateSlug(dto.name) },
    });
  }

  /**
   * Lấy tất cả tags + đếm số bài viết mỗi tag
   *
   * _count.select.posts: Prisma đếm số PostTag records liên quan
   * → Hiển thị: "NestJS (15 bài)" trên UI
   *
   * Không phân trang vì tags thường ít (< 100)
   */
  async findAll() {
    return this.prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Xóa tag
   *
   * LƯU Ý: Prisma cascade sẽ tự xóa PostTag records liên quan
   * (tùy thuộc onDelete config trong schema.prisma)
   */
  async remove(id: number) {
    const tag = await this.prisma.tag.findUnique({ where: { id } });
    if (!tag) throw new NotFoundException(`Tag ID ${id} không tồn tại`);

    await this.prisma.tag.delete({ where: { id } });
    return { message: `Đã xóa tag "${tag.name}"` };
  }
}

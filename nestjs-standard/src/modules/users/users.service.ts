/**
 * KHÁI NIỆM: Users Service — CRUD operations cho User entity
 *
 * ĐÂY LÀ PATTERN CHUẨN MVC:
 * - Service chứa TẤT CẢ business logic
 * - Service gọi Prisma trực tiếp (không qua repository interface)
 * - Controller chỉ delegate, không có logic
 *
 * SO SÁNH DDD vs MVC:
 * ┌──────────────────┬───────────────────────┬──────────────────────────┐
 * │                  │ Standard MVC          │ DDD                      │
 * ├──────────────────┼───────────────────────┼──────────────────────────┤
 * │ Logic nằm ở      │ Service               │ Domain Entity            │
 * │ Data access      │ Service → Prisma      │ Handler → Repository     │
 * │ Validation       │ DTO + Service         │ Value Objects            │
 * │ Số files/feature │ 3-5 files             │ 10-15 files              │
 * │ Thời gian dev    │ Nhanh                 │ Chậm (nhưng maintain dễ) │
 * └──────────────────┴───────────────────────┴──────────────────────────┘
 *
 * PRISMA QUERY PATTERNS DEMO:
 * - findMany(): Lấy nhiều records (+ filter, sort, pagination)
 * - findUnique(): Lấy 1 record theo unique field (id, email)
 * - update(): Cập nhật 1 record
 * - delete(): Xóa 1 record
 * - select: Chọn fields trả về (tránh trả password ra API!)
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lấy danh sách users (có phân trang)
   *
   * PRISMA PAGINATION:
   * - skip: Bỏ qua N records đầu tiên
   * - take: Lấy N records
   * - skip = (page - 1) * limit → công thức tính offset
   *
   * SELECT: Chỉ trả về fields cần thiết
   * → KHÔNG trả password ra API (bảo mật!)
   */
  async findAll(query: PaginationQueryDto) {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          // password: false ← KHÔNG trả password
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Lấy user theo ID
   *
   * findUnique(): Tìm theo primary key hoặc unique field
   * Nếu không tìm thấy → null → throw NotFoundException
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { posts: true, comments: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    return user;
  }

  /** Lấy user theo email (dùng nội bộ, ví dụ check trùng email) */
  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Cập nhật user
   *
   * Prisma update(): Cập nhật fields trong `data`
   * Chỉ fields có trong dto mới được cập nhật (partial update)
   */
  async update(id: number, dto: UpdateUserDto) {
    /** Check user tồn tại trước khi update */
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Xóa user (hard delete)
   *
   * LƯU Ý: Production nên dùng soft delete (set deletedAt)
   * Ở đây dùng hard delete để demo Prisma delete()
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
    return { message: `Đã xóa user ${id}` };
  }
}

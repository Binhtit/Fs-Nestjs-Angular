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
import { plainToInstance } from 'class-transformer';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { UserEntity } from './entities/user.entity';

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
        /** SOFT DELETE: Chỉ lấy users chưa bị xóa (deletedAt: null) */
        where: { deletedAt: null },
        /**
         * Không dùng select nữa — ClassSerializerInterceptor + @Exclude() trên UserEntity
         * sẽ tự động loại bỏ password trước khi serialize ra response
         *
         * TRADE-OFF:
         * - select: Không query password từ DB (tốt hơn về DB performance)
         * - @Exclude(): Query có password nhưng không serialize ra (đơn giản hơn về code)
         * → Dự án này ưu tiên code clean hơn, DB performance không phải bottleneck
         */
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return {
      /**
       * plainToInstance(UserEntity, users):
       * - Prisma trả mảng plain objects → convert sang mảng UserEntity instances
       * - ClassSerializerInterceptor sẽ apply @Exclude() → bỏ password
       * - excludeExtraneousValues: true → chỉ giữ fields có @Expose()
       */
      data: plainToInstance(UserEntity, users, { excludeExtraneousValues: true }),
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
    /** SOFT DELETE: Thêm deletedAt: null để không trả user đã bị xóa */
    const user = await this.prisma.user.findUnique({
      where: { id, deletedAt: null },
      include: {
        _count: { select: { posts: true, comments: true } },
      },
    });

    if (!user) {
      throw new NotFoundException(`User với ID ${id} không tồn tại`);
    }

    /** plainToInstance: convert để ClassSerializerInterceptor apply @Exclude() */
    return plainToInstance(UserEntity, user, { excludeExtraneousValues: true });
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

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return plainToInstance(UserEntity, updated, { excludeExtraneousValues: true });
  }

  /**
   * Xóa user — SOFT DELETE (ghi deletedAt, không xóa thật)
   *
   * SOFT DELETE vs HARD DELETE:
   * ┌─────────────────┬──────────────────────┬──────────────────────────┐
   * │                 │ Hard Delete          │ Soft Delete              │
   * ├─────────────────┼──────────────────────┼──────────────────────────┤
   * │ Câu SQL         │ DELETE FROM users... │ UPDATE users SET         │
   * │                 │                      │   deletedAt = now()...   │
   * │ Có thể khôi phục│ Không                │ Có (set deletedAt = null)│
   * │ Audit trail     │ Mất thông tin        │ Biết khi nào bị xóa      │
   * │ DB storage      │ Nhỏ hơn              │ Lớn hơn (cần cleanup job)│
   * │ Query phức tạp  │ Không                │ Phải luôn filter deletedAt│
   * └─────────────────┴──────────────────────┴──────────────────────────┘
   *
   * Ở đây prisma.user.delete() sẽ bị Prisma middleware intercept
   * → Tự động đổi thành update { deletedAt: new Date() }
   * → Service/Controller không cần biết logic này
   */
  async remove(id: number) {
    await this.findOne(id);
    /**
     * SOFT DELETE: Gọi update thay vì delete
     *
     * Prisma v7 đã bỏ $use() middleware → không thể intercept delete() tự động
     * → Phải gọi update() trực tiếp với deletedAt = new Date()
     *
     * SQL tương đương: UPDATE users SET deletedAt = now() WHERE id = ?
     * → Record vẫn còn trong DB, findMany với { deletedAt: null } sẽ không thấy
     */
    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return { message: `Đã xóa user ${id} (soft delete)` };
  }
}

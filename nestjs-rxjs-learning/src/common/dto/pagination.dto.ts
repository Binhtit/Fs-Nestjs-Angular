/**
 * KHÁI NIỆM: Pagination Query DTO
 *
 * TẠI SAO cần pagination:
 * 1. Performance: Không load toàn bộ data một lần (tưởng tượng 1 triệu records)
 * 2. UX: User xem từng trang, load nhanh hơn
 * 3. Bandwidth: Giảm data truyền qua network
 *
 * PATTERN: Offset-based Pagination
 * - page + limit → OFFSET = (page - 1) * limit
 * - Ưu điểm: Đơn giản, jump trang bất kỳ
 * - Nhược điểm: Performance giảm ở page lớn (OFFSET phải scan)
 *
 * PATTERN khác: Cursor-based Pagination
 * - Dùng cursor (vd: last_id) thay vì offset
 * - Ưu điểm: Performance ổn định ở mọi trang
 * - Nhược điểm: Không jump trang, chỉ next/prev
 * - Dùng cho: Feed, infinite scroll (Facebook, Twitter)
 *
 * Trong dự án này dùng Offset-based vì phù hợp với admin panel, CRUD đơn giản.
 */
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
} from '../constants/app.constant';

export class PaginationQueryDto {
  /**
   * Trang hiện tại (bắt đầu từ 1)
   *
   * @Type(() => Number): class-transformer convert string → number
   * TẠI SAO cần: Query params luôn là string, cần transform sang number
   * Ví dụ: ?page=2 → query.page = "2" (string) → transform → 2 (number)
   */
  @ApiPropertyOptional({
    description: 'Số trang (bắt đầu từ 1)',
    default: DEFAULT_PAGE,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page phải >= 1' })
  page: number = DEFAULT_PAGE;

  /**
   * Số item mỗi trang
   *
   * @Max(MAX_PAGE_SIZE): Giới hạn tối đa để tránh client request quá nhiều data
   * LỖI PHỔ BIẾN: Không giới hạn → client gửi limit=999999 → server quá tải
   */
  @ApiPropertyOptional({
    description: 'Số item mỗi trang',
    default: DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit phải là số nguyên' })
  @Min(1, { message: 'limit phải >= 1' })
  @Max(MAX_PAGE_SIZE, { message: `limit tối đa là ${MAX_PAGE_SIZE}` })
  limit: number = DEFAULT_PAGE_SIZE;

  /**
   * Field để sort
   * Chỉ cho phép sort theo một số field nhất định (whitelist)
   *
   * TẠI SAO cần whitelist:
   * - SQL Injection: Client gửi sortBy="; DROP TABLE users; --"
   * - Performance: Sort theo field không có index → query chậm
   */
  @ApiPropertyOptional({
    description: 'Field để sort',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  /**
   * Thứ tự sort: ASC (tăng dần) hoặc DESC (giảm dần)
   *
   * @IsIn: Chỉ chấp nhận giá trị trong danh sách
   * Nếu client gửi sortOrder=RANDOM → validation error
   */
  @ApiPropertyOptional({
    description: 'Thứ tự sort',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsIn(['ASC', 'DESC'], { message: 'sortOrder phải là ASC hoặc DESC' })
  sortOrder: 'ASC' | 'DESC' = 'DESC';
}

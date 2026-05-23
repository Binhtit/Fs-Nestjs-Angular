/**
 * Categories Controller — Simple CRUD cho danh mục
 *
 * PHÂN QUYỀN:
 * - GET (list, detail): @Public() → ai cũng xem được
 * - POST, PATCH, DELETE: Admin only
 *
 * CACHING (Cache-aside pattern):
 * - CacheInterceptor: Tự động cache response của GET endpoint
 * - CacheTTL: Override TTL mặc định (300s = 5 phút)
 * - Khi create/update/delete → CategoriesService xóa cache thủ công
 *
 * TẠI SAO CACHE CATEGORIES:
 * - Categories thay đổi rất ít (admin thỉnh thoảng mới thêm/sửa)
 * - Được đọc rất nhiều (mọi request list posts đều cần categories)
 * - Cache 5 phút → giảm ~90% queries xuống DB
 */
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * GET /categories — Danh sách categories
   *
   * @UseInterceptors(CacheInterceptor): Tự động cache response này
   * @CacheTTL(300000): Cache 5 phút (300,000ms)
   *   → Ghi đè TTL mặc định 60s từ CacheModule.register({ ttl: 60000 })
   *   → Categories ít thay đổi → cache lâu hơn tiết kiệm DB query
   *
   * Cache key: Tự động generate từ URL → "GET:/api/v1/categories"
   * Cache hit: Request thứ 2 trở đi không chạm DB, trả response tức thì
   * Cache miss: Request đầu tiên query DB → store vào cache → return
   *
   * CACHE-ASIDE PATTERN:
   * 1. Check cache trước
   * 2. Nếu miss → query DB → lưu vào cache → return
   * 3. Khi data thay đổi → xóa cache (invalidate) để next request refresh
   */
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @ApiOperation({ summary: 'Danh sách tất cả categories (public, cached 5 phút)' })
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Public()
  @ApiOperation({ summary: 'Chi tiết category theo slug (public)' })
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tạo category mới (Admin only)' })
  @Post()
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật category (Admin only)' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa category (Admin only)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoriesService.remove(id);
  }
}

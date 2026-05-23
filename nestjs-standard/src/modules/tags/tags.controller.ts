/**
 * Tags Controller — API quản lý nhãn bài viết
 *
 * ROUTE DESIGN:
 * - GET /tags      → List tất cả tags (public)
 * - POST /tags     → Tạo tag mới (cần đăng nhập)
 * - DELETE /tags/:id → Xóa tag (Admin only)
 *
 * PHÂN QUYỀN:
 * - GET:    @Public() → ai cũng xem được danh sách tags
 * - POST:   Authenticated → bất kỳ user đã đăng nhập
 * - DELETE: @Roles('ADMIN') → chỉ Admin mới xóa được
 *
 * SO SÁNH VỚI CATEGORIES CONTROLLER:
 * - Categories có PATCH (update) → Tags không cần update (chỉ tạo/xóa)
 * - Categories lookup bằng slug → Tags chỉ cần list all
 * - Lý do: Tags thường đơn giản, nếu sai → xóa tạo lại
 *
 * THIẾU GÌ (có thể mở rộng):
 * - GET /tags/:slug → chi tiết tag + list posts của tag
 * - PATCH /tags/:id → đổi tên tag
 */
import { Controller, Get, Post, Delete, Body, Param, ParseIntPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Public } from '../../common/decorators/public.decorator';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { TagsService } from './tags.service';
import { CreateTagDto } from './dto/tag.dto';

@ApiTags('Tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * GET /api/v1/tags — Danh sách tất cả tags (cached)
   *
   * @Public() → không cần JWT token
   * @UseInterceptors(CacheInterceptor): Cache response 5 phút
   * @CacheTTL(300000): 300,000ms = 5 phút
   *
   * Tags tương tự Categories: ít thay đổi, đọc nhiều
   * → Cache-aside pattern: tự động cache read, manual invalidate khi write
   * → TagsService sẽ gọi cacheManager.reset() sau create/delete
   *
   * Response bao gồm _count.posts → số bài viết mỗi tag
   */
  @Public()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000)
  @ApiOperation({ summary: 'Danh sách tags (public, cached 5 phút)' })
  @Get()
  findAll() {
    return this.tagsService.findAll();
  }

  /**
   * POST /api/v1/tags — Tạo tag mới
   *
   * Không cần @Public() → JwtAuthGuard yêu cầu JWT token
   * Bất kỳ authenticated user (READER, AUTHOR, ADMIN) đều tạo được
   * → Nếu muốn giới hạn: thêm @UseGuards(RolesGuard) + @Roles('AUTHOR', 'ADMIN')
   */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo tag mới (cần đăng nhập)' })
  @Post()
  create(@Body() dto: CreateTagDto) {
    return this.tagsService.create(dto);
  }

  /**
   * DELETE /api/v1/tags/:id — Xóa tag
   *
   * @UseGuards(RolesGuard) + @Roles('ADMIN'):
   * → Chỉ ADMIN mới xóa được tag
   * → AUTHOR tạo tag được nhưng không xóa được → tránh mất data
   *
   * ParseIntPipe: /tags/abc → 400 Bad Request (phải là số)
   */
  @ApiBearerAuth('JWT-auth')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa tag (Admin only)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tagsService.remove(id);
  }
}

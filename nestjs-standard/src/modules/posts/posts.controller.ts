/**
 * Posts Controller — CRUD API cho bài viết
 *
 * ROUTE DESIGN (RESTful):
 * - GET /posts       → List posts (public, paginated)
 * - GET /posts/:slug → Detail by slug (public, SEO-friendly)
 * - POST /posts      → Create post (Author+, authenticated)
 * - PATCH /posts/:id → Update post (owner/admin)
 * - DELETE /posts/:id → Delete post (owner/admin)
 */
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TrimStringPipe } from '../../common/pipes/trim-string.pipe';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, QueryPostDto } from './dto/post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  /** List posts — public (mọi người đều xem được) */
  @Public()
  @ApiOperation({ summary: 'Danh sách bài viết (public, có filter/search/pagination)' })
  @Get()
  findAll(@Query() query: QueryPostDto) {
    return this.postsService.findAll(query);
  }

  /** Detail by slug — public */
  @Public()
  @ApiOperation({ summary: 'Chi tiết bài viết theo slug (public)' })
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.postsService.findBySlug(slug);
  }

  /** Create post — phải đăng nhập */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Tạo bài viết mới (cần đăng nhập)' })
  @Post()
  create(
    /**
     * TrimStringPipe: Bỏ khoảng trắng đầu/cuối trong title, content, excerpt
     * → "  Hello World  " → "Hello World"
     * → Áp dụng cho toàn bộ body object (đệ quy)
     *
     * Pipe được apply TRƯỚC khi DTO validation chạy
     * → String đã được trim → @MaxLength tính đúng độ dài thực
     */
    @Body(TrimStringPipe) dto: CreatePostDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.postsService.create(dto, userId);
  }

  /**
   * PATCH /posts/:id/publish — Publish bài viết (dùng $transaction)
   *
   * Demo Prisma $transaction: atomic publish post
   * Route /publish phải đặt TRƯỚC /:id để không bị hiểu là id='publish'
   */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Publish bài viết (dùng $transaction)' })
  @Patch(':id/publish')
  publish(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.postsService.publishPost(id, userId, userRole);
  }

  /** Update post — chỉ owner/admin */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cập nhật bài viết (owner/admin)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.postsService.update(id, dto, userId, userRole);
  }

  /** Delete post — chỉ owner/admin */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa bài viết (owner/admin)' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.postsService.remove(id, userId, userRole);
  }
}

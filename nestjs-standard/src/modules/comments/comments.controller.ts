/**
 * Comments Controller — Nested Resource Pattern
 *
 * URL: /api/v1/posts/:postId/comments
 *
 * NESTED RESOURCE là gì:
 * - Comment KHÔNG tồn tại độc lập — luôn thuộc 1 Post
 * - URL phản ánh quan hệ: /posts/1/comments → comments của post 1
 * - Route params: @Param('postId') → lấy postId từ URL
 *
 * SO SÁNH FLAT vs NESTED:
 * - FLAT:   GET /comments?postId=1     → Tất cả comments, filter bằng query
 * - NESTED: GET /posts/1/comments      → Rõ ràng hơn, RESTful hơn
 * → Nested phù hợp khi resource KHÔNG CÓ Ý NGHĨA nếu không có parent
 */
import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CommentsService } from './comments.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@ApiTags('Comments')
@Controller('posts/:postId/comments') // ← Nested route!
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  /** List comments của 1 bài viết — public */
  @Public()
  @ApiOperation({ summary: 'Danh sách bình luận của bài viết (public)' })
  @Get()
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.commentsService.findByPost(postId);
  }

  /** Thêm comment — phải đăng nhập */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Thêm bình luận (cần đăng nhập)' })
  @Post()
  create(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.create(postId, dto, userId);
  }

  /** Sửa comment — chỉ owner */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Sửa bình luận (owner only)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.commentsService.update(id, dto, userId);
  }

  /** Xóa comment — owner hoặc admin */
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Xóa bình luận (owner/admin)' })
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @CurrentUser('role') userRole: string,
  ) {
    return this.commentsService.remove(id, userId, userRole);
  }
}

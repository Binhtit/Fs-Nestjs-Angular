/**
 * Comments Service — CRUD cho bình luận (nested resource)
 *
 * NESTED RESOURCE:
 * - Comment luôn thuộc về 1 Post
 * - URL: /posts/:postId/comments → postId là context bắt buộc
 * - Tạo comment → phải truyền postId
 * - List comments → chỉ lấy của post cụ thể
 */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Tạo comment cho 1 bài viết */
  async create(postId: number, dto: CreateCommentDto, authorId: number) {
    /** Check post tồn tại */
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException(`Bài viết ID ${postId} không tồn tại`);
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  /** Lấy comments của 1 bài viết (mới nhất trước) */
  async findByPost(postId: number) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Sửa comment (chỉ owner) */
  async update(id: number, dto: UpdateCommentDto, userId: number) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment ID ${id} không tồn tại`);
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('Bạn chỉ được sửa bình luận của mình');
    }

    return this.prisma.comment.update({
      where: { id },
      data: { content: dto.content },
      include: {
        author: { select: { id: true, name: true } },
      },
    });
  }

  /** Xóa comment (owner hoặc admin) */
  async remove(id: number, userId: number, userRole: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id } });
    if (!comment) {
      throw new NotFoundException(`Comment ID ${id} không tồn tại`);
    }

    if (comment.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.prisma.comment.delete({ where: { id } });
    return { message: 'Đã xóa bình luận' };
  }
}

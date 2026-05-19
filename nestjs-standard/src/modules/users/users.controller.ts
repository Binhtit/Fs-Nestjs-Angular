/**
 * Users Controller — CRUD API cho quản lý User (Admin only)
 *
 * ROUTE DESIGN:
 * - GET /users       → List all users (paginated)
 * - GET /users/me    → Current user profile (bất kỳ authenticated user)
 * - GET /users/:id   → User detail
 * - PATCH /users/:id → Update user
 * - DELETE /users/:id → Delete user
 *
 * PHÂN QUYỀN:
 * - /me: Mọi authenticated user
 * - Các route khác: Chỉ ADMIN
 *
 * @ApiBearerAuth(): Hiện ổ khóa JWT trong Swagger UI
 * @UseGuards(RolesGuard): Kiểm tra role
 * @Roles('ADMIN'): Chỉ ADMIN access được
 */
import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard, Roles } from '../../common/guards/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /users/me — Profile của user hiện tại
   *
   * LƯU Ý: Route /me PHẢI đặt TRƯỚC /:id
   * Vì NestJS match route theo thứ tự — nếu /:id trước → "me" bị hiểu là id
   */
  @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
  @Get('me')
  getMe(@CurrentUser('id') userId: number) {
    return this.usersService.findOne(userId);
  }

  /**
   * GET /users — List tất cả users (Admin only)
   *
   * @UseGuards(RolesGuard): Kích hoạt RolesGuard cho route này
   * @Roles('ADMIN'): Chỉ user có role ADMIN mới access được
   * @Query() query: Tự động parse query params (?page=1&limit=10)
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Danh sách users (Admin only)' })
  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usersService.findAll(query);
  }

  /**
   * GET /users/:id — Chi tiết user
   *
   * ParseIntPipe: Convert string param → number
   * URL params luôn là string: /users/1 → id = "1" (string)
   * ParseIntPipe: "1" → 1 (number), "abc" → 400 Bad Request
   */
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Chi tiết user (Admin only)' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Cập nhật user (Admin only)' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Xóa user (Admin only)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

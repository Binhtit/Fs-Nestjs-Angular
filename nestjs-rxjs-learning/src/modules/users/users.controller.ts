/**
 * KHÁI NIỆM: RESTful Controller
 * Controller là "thin layer" - chỉ nhận request, gọi service, trả response
 * KHÔNG chứa business logic (đặt trong service)
 */
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Tạo user mới (Admin only)' })
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @ApiOperation({ summary: 'Lấy danh sách users (Admin only)' })
  @Roles('admin')
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * @Param('id', ParseIntPipe): Parse string → number + validate
   * ParseIntPipe throw 400 nếu id không phải number
   */
  @ApiOperation({ summary: 'Lấy user theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật user' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }

  @ApiOperation({ summary: 'Xóa user (Admin only)' })
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}

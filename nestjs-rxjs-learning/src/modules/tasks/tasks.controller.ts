import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiBearerAuth('JWT-auth')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Tạo task mới' })
  @Post()
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: number) {
    /** NestJS tự subscribe Observable từ service → return response */
    return this.tasksService.create(dto, userId);
  }

  @ApiOperation({ summary: 'Lấy danh sách tasks (có phân trang)' })
  @Get()
  findAll(@Query() query: QueryTaskDto, @CurrentUser('id') userId: number) {
    return this.tasksService.findAll(query, userId);
  }

  @ApiOperation({ summary: 'Lấy task theo ID' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.tasksService.findOne(id, userId);
  }

  @ApiOperation({ summary: 'Cập nhật task' })
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.tasksService.update(id, dto, userId);
  }

  @ApiOperation({ summary: 'Xóa task (soft delete)' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser('id') userId: number) {
    return this.tasksService.remove(id, userId);
  }
}

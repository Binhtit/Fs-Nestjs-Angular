/**
 * KHÁI NIỆM: Thin Controller (DDD/Clean Architecture)
 *
 * Controller trong DDD/CQRS:
 * - KHÔNG chứa business logic
 * - Chỉ làm 3 việc: (1) Parse request, (2) Dispatch command/query, (3) Return response
 * - Delegate mọi thứ cho CommandBus/QueryBus
 *
 * TRƯỚC (Monolith):
 *   Controller → Service → Repository
 *
 * SAU (DDD + CQRS):
 *   Controller → CommandBus/QueryBus → Handler → Domain → Repository
 */
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import {
  CreateTaskCommand,
  UpdateTaskCommand,
  DeleteTaskCommand,
} from '../../application/commands/task.commands';
import {
  GetTasksQuery,
  GetTaskByIdQuery,
} from '../../application/queries/task.queries';
import { CreateTaskDto } from '../../dto/create-task.dto';
import { UpdateTaskDto } from '../../dto/update-task.dto';
import { QueryTaskDto } from '../../dto/query-task.dto';
import { Task } from '../../domain/entities/task.entity';

@ApiTags('Tasks (DDD + CQRS)')
@ApiBearerAuth()
@Controller('tasks')
export class TasksDddController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Tạo task mới (qua CommandBus)' })
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    const command = new CreateTaskCommand(
      dto.title,
      userId,
      dto.description,
      dto.dueDate,
    );
    const task: Task = await this.commandBus.execute(command);
    return this.toResponse(task);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách tasks (qua QueryBus)' })
  async findAll(
    @Query() query: QueryTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    const q = new GetTasksQuery(
      userId,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      query.status,
      query.search,
    );
    const result = await this.queryBus.execute(q);
    return {
      tasks: result.tasks.map(this.toResponse),
      total: result.total,
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy task theo ID' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    const task: Task = await this.queryBus.execute(
      new GetTaskByIdQuery(id, userId),
    );
    return this.toResponse(task);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Cập nhật task (qua CommandBus)' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTaskDto,
    @CurrentUser('id') userId: number,
  ) {
    const command = new UpdateTaskCommand(
      id,
      userId,
      dto.title,
      dto.description,
      dto.status,
    );
    const task: Task = await this.commandBus.execute(command);
    return this.toResponse(task);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa task (soft delete)' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
  ) {
    await this.commandBus.execute(new DeleteTaskCommand(id, userId));
    return { deleted: true };
  }

  /** Convert Domain Entity → API Response (loại bỏ internal details) */
  private toResponse(task: Task) {
    return {
      id: task.id,
      title: task.title.getValue(),
      description: task.description,
      status: task.status.getValue(),
      dueDate: task.dueDate,
      userId: task.userId,
      isOverdue: task.isOverdue(),
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}

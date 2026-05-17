/**
 * KHÁI NIỆM: CQRS Queries — Read Side
 *
 * QUERY:
 * - Object mô tả DATA muốn đọc (declarative: "Get tasks with filter X")
 * - KHÔNG thay đổi state (read-only)
 * - Có thể cache, có thể dùng read replica DB
 */
import { IQuery, IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { TASK_REPOSITORY } from '../../domain/repositories/task.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
import { BusinessException } from '../../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../../common/constants/error-code.constant';

/** Query: Lấy danh sách tasks */
export class GetTasksQuery implements IQuery {
  constructor(
    public readonly userId: number,
    public readonly page: number = 1,
    public readonly limit: number = 10,
    public readonly sortBy: string = 'createdAt',
    public readonly sortOrder: 'ASC' | 'DESC' = 'DESC',
    public readonly status?: string,
    public readonly search?: string,
  ) {}
}

/** Query: Lấy 1 task theo ID */
export class GetTaskByIdQuery implements IQuery {
  constructor(
    public readonly taskId: number,
    public readonly userId: number,
  ) {}
}

/**
 * GetTasksHandler
 *
 * TẠI SAO Query Handler tách khỏi Command Handler:
 * - Read có thể CACHE (write không nên cache)
 * - Read có thể dùng READ REPLICA DB (scale horizontally)
 * - Read có thể dùng denormalized view (khác schema với write)
 */
@QueryHandler(GetTasksQuery)
export class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(query: GetTasksQuery): Promise<{ tasks: Task[]; total: number }> {
    return this.taskRepo.findAll({
      userId: query.userId,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      search: query.search,
    });
  }
}

@QueryHandler(GetTaskByIdQuery)
export class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
  ) {}

  async execute(query: GetTaskByIdQuery): Promise<Task> {
    const task = await this.taskRepo.findById(query.taskId, query.userId);
    if (!task) {
      throw BusinessException.notFound(
        ERROR_CODES.TASK_NOT_FOUND.code,
        ERROR_CODES.TASK_NOT_FOUND.message,
      );
    }
    return task;
  }
}

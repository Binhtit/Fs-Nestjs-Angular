/**
 * KHÁI NIỆM: Command Handlers — CQRS Write Side
 *
 * COMMAND HANDLER:
 * - Nhận 1 Command → thực hiện business logic → persist → publish events
 * - Mỗi Handler xử lý ĐÚNG 1 Command (Single Responsibility)
 * - Orchestrator: Gọi Domain Service/Entity → gọi Repository → publish Event
 *
 * FLOW:
 * Controller → CommandBus.execute(command) → Handler.execute(command) → return result
 *
 * TẠI SAO dùng CommandBus thay vì gọi Service trực tiếp:
 * 1. DECOUPLING: Controller không biết Handler nào xử lý
 * 2. MIDDLEWARE: CommandBus có thể add logging, validation, transaction
 * 3. ASYNC: Có thể chuyển sang async processing dễ dàng
 */
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Task } from '../../domain/entities/task.entity';
import { TASK_REPOSITORY } from '../../domain/repositories/task.repository';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskDeletedEvent,
  TaskCompletedEvent,
} from '../../domain/events/task.events';
import { BusinessException } from '../../../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../../../common/constants/error-code.constant';
import {
  CreateTaskCommand,
  UpdateTaskCommand,
  DeleteTaskCommand,
} from './task.commands';

/**
 * CreateTaskHandler
 * Command: CreateTaskCommand → Domain: Task.create() → Persist → Event
 */
@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    // 1. Domain logic: Tạo Task qua factory method (validate bởi Value Objects)
    const task = Task.create(
      command.title,
      command.userId,
      command.description,
      command.dueDate ? new Date(command.dueDate) : null,
    );

    // 2. Persist qua Repository Port
    const saved = await this.taskRepo.save(task);

    // 3. Publish Domain Event → handlers tự xử lý side effects
    this.eventBus.publish(
      new TaskCreatedEvent(saved.id!, saved.title.getValue(), saved.userId),
    );

    return saved;
  }
}

/**
 * UpdateTaskHandler
 * Tìm task → apply changes → validate transitions → persist → event
 */
@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateTaskCommand): Promise<Task> {
    const task = await this.taskRepo.findById(command.taskId, command.userId);
    if (!task) {
      throw BusinessException.notFound(
        ERROR_CODES.TASK_NOT_FOUND.code,
        ERROR_CODES.TASK_NOT_FOUND.message,
      );
    }

    const changes: Record<string, unknown> = {};

    // Apply changes qua Domain Entity methods (enforce business rules)
    if (command.title) {
      task.changeTitle(command.title);
      changes.title = command.title;
    }
    if (command.description !== undefined) {
      task.updateDescription(command.description ?? null);
      changes.description = command.description;
    }

    const wasCompleted = task.status.isCompleted();
    if (command.status) {
      task.changeStatus(command.status); // State machine validates transition
      changes.status = command.status;
    }

    const saved = await this.taskRepo.save(task);

    // Publish specific event based on what changed
    if (!wasCompleted && saved.status.isCompleted()) {
      this.eventBus.publish(
        new TaskCompletedEvent(saved.id!, saved.userId, new Date()),
      );
    } else {
      this.eventBus.publish(
        new TaskUpdatedEvent(saved.id!, changes, saved.userId),
      );
    }

    return saved;
  }
}

/**
 * DeleteTaskHandler
 */
@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(
    @Inject(TASK_REPOSITORY)
    private readonly taskRepo: ITaskRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteTaskCommand): Promise<void> {
    await this.taskRepo.softDelete(command.taskId, command.userId);
    this.eventBus.publish(new TaskDeletedEvent(command.taskId, command.userId));
  }
}

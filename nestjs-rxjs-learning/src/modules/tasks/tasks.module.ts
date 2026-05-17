/**
 * Tasks Module — DDD + CQRS Wiring
 *
 * MODULE là BOUNDED CONTEXT trong DDD:
 * - Đóng gói toàn bộ: Domain, Application, Infrastructure
 * - Register: Repository Adapter, Command/Query/Event Handlers
 * - Export: chỉ những gì module khác cần
 *
 * PROVIDER REGISTRATION:
 * - TASK_REPOSITORY: Symbol token → inject interface, resolve implementation
 * - CqrsModule: Tự động discover và register tất cả handlers
 */
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

// Infrastructure
import { TaskOrmEntity } from './infrastructure/persistence/task.orm-entity';
import { TaskTypeOrmRepository } from './infrastructure/persistence/task.typeorm-repository';
import { TasksDddController } from './infrastructure/controllers/tasks-ddd.controller';

// Domain
import { TASK_REPOSITORY } from './domain/repositories/task.repository';

// Application - CQRS Handlers
import {
  CreateTaskHandler,
  UpdateTaskHandler,
  DeleteTaskHandler,
} from './application/commands/task.handlers';
import {
  GetTasksHandler,
  GetTaskByIdHandler,
} from './application/queries/task.queries';
import {
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskCompletedHandler,
  TaskDeletedHandler,
} from './application/events/task-event.handlers';

// Legacy service (giữ lại để so sánh DDD vs non-DDD)
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { TaskEntity } from './entities/task.entity';

/** Tất cả CQRS Handlers */
const CommandHandlers = [CreateTaskHandler, UpdateTaskHandler, DeleteTaskHandler];
const QueryHandlers = [GetTasksHandler, GetTaskByIdHandler];
const EventHandlers = [
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskCompletedHandler,
  TaskDeletedHandler,
];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([TaskOrmEntity, TaskEntity]),
  ],
  controllers: [
    TasksDddController, // DDD controller (CommandBus/QueryBus)
    TasksController,    // Legacy controller (giữ để so sánh)
  ],
  providers: [
    // DDD: Repository Port → Adapter binding
    {
      provide: TASK_REPOSITORY,
      useClass: TaskTypeOrmRepository,
    },

    // CQRS: Register all handlers
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,

    // Legacy service (giữ lại)
    TasksService,
  ],
})
export class TasksModule {}

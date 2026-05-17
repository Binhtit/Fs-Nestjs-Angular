import { EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Task } from '../../domain/entities/task.entity';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import { CreateTaskCommand, UpdateTaskCommand, DeleteTaskCommand } from './task.commands';
export declare class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
    private readonly taskRepo;
    private readonly eventBus;
    constructor(taskRepo: ITaskRepository, eventBus: EventBus);
    execute(command: CreateTaskCommand): Promise<Task>;
}
export declare class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
    private readonly taskRepo;
    private readonly eventBus;
    constructor(taskRepo: ITaskRepository, eventBus: EventBus);
    execute(command: UpdateTaskCommand): Promise<Task>;
}
export declare class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
    private readonly taskRepo;
    private readonly eventBus;
    constructor(taskRepo: ITaskRepository, eventBus: EventBus);
    execute(command: DeleteTaskCommand): Promise<void>;
}

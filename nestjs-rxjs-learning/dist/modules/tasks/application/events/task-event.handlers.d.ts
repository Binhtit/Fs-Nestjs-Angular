import { IEventHandler } from '@nestjs/cqrs';
import { TaskCreatedEvent, TaskUpdatedEvent, TaskCompletedEvent, TaskDeletedEvent } from '../../domain/events/task.events';
export declare class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
    private readonly logger;
    handle(event: TaskCreatedEvent): void;
}
export declare class TaskUpdatedHandler implements IEventHandler<TaskUpdatedEvent> {
    private readonly logger;
    handle(event: TaskUpdatedEvent): void;
}
export declare class TaskCompletedHandler implements IEventHandler<TaskCompletedEvent> {
    private readonly logger;
    handle(event: TaskCompletedEvent): void;
}
export declare class TaskDeletedHandler implements IEventHandler<TaskDeletedEvent> {
    private readonly logger;
    handle(event: TaskDeletedEvent): void;
}

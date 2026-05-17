import { IEvent } from '@nestjs/cqrs';
export declare abstract class DomainEvent implements IEvent {
    readonly occurredAt: Date;
    constructor();
}
export declare class TaskCreatedEvent extends DomainEvent {
    readonly taskId: number;
    readonly title: string;
    readonly userId: number;
    constructor(taskId: number, title: string, userId: number);
}
export declare class TaskUpdatedEvent extends DomainEvent {
    readonly taskId: number;
    readonly changes: Record<string, unknown>;
    readonly userId: number;
    constructor(taskId: number, changes: Record<string, unknown>, userId: number);
}
export declare class TaskCompletedEvent extends DomainEvent {
    readonly taskId: number;
    readonly userId: number;
    readonly completedAt: Date;
    constructor(taskId: number, userId: number, completedAt: Date);
}
export declare class TaskDeletedEvent extends DomainEvent {
    readonly taskId: number;
    readonly userId: number;
    constructor(taskId: number, userId: number);
}

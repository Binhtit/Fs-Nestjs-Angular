import { IQuery, IQueryHandler } from '@nestjs/cqrs';
import type { ITaskRepository } from '../../domain/repositories/task.repository';
import { Task } from '../../domain/entities/task.entity';
export declare class GetTasksQuery implements IQuery {
    readonly userId: number;
    readonly page: number;
    readonly limit: number;
    readonly sortBy: string;
    readonly sortOrder: 'ASC' | 'DESC';
    readonly status?: string | undefined;
    readonly search?: string | undefined;
    constructor(userId: number, page?: number, limit?: number, sortBy?: string, sortOrder?: 'ASC' | 'DESC', status?: string | undefined, search?: string | undefined);
}
export declare class GetTaskByIdQuery implements IQuery {
    readonly taskId: number;
    readonly userId: number;
    constructor(taskId: number, userId: number);
}
export declare class GetTasksHandler implements IQueryHandler<GetTasksQuery> {
    private readonly taskRepo;
    constructor(taskRepo: ITaskRepository);
    execute(query: GetTasksQuery): Promise<{
        tasks: Task[];
        total: number;
    }>;
}
export declare class GetTaskByIdHandler implements IQueryHandler<GetTaskByIdQuery> {
    private readonly taskRepo;
    constructor(taskRepo: ITaskRepository);
    execute(query: GetTaskByIdQuery): Promise<Task>;
}

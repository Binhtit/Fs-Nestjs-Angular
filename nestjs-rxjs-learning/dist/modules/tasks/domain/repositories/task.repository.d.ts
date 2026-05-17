import { Task } from '../entities/task.entity';
export interface ITaskRepository {
    save(task: Task): Promise<Task>;
    findById(id: number, userId: number): Promise<Task | null>;
    findAll(params: FindAllParams): Promise<{
        tasks: Task[];
        total: number;
    }>;
    softDelete(id: number, userId: number): Promise<void>;
}
export interface FindAllParams {
    userId: number;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'ASC' | 'DESC';
    status?: string;
    search?: string;
}
export declare const TASK_REPOSITORY: unique symbol;

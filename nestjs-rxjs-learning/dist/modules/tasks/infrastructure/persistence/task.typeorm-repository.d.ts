import { Repository } from 'typeorm';
import { Task } from '../../domain/entities/task.entity';
import { FindAllParams, ITaskRepository } from '../../domain/repositories/task.repository';
import { TaskOrmEntity } from './task.orm-entity';
export declare class TaskTypeOrmRepository implements ITaskRepository {
    private readonly ormRepo;
    constructor(ormRepo: Repository<TaskOrmEntity>);
    save(task: Task): Promise<Task>;
    findById(id: number, userId: number): Promise<Task | null>;
    findAll(params: FindAllParams): Promise<{
        tasks: Task[];
        total: number;
    }>;
    softDelete(id: number, userId: number): Promise<void>;
}

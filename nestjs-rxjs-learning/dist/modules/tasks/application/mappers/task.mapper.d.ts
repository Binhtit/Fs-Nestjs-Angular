import { Task } from '../../domain/entities/task.entity';
import { TaskOrmEntity } from '../../infrastructure/persistence/task.orm-entity';
export declare class TaskMapper {
    static toDomain(orm: TaskOrmEntity): Task;
    static toPersistence(domain: Task): Partial<TaskOrmEntity>;
}

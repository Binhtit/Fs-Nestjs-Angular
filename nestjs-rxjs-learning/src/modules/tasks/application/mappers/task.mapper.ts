/**
 * KHÁI NIỆM: Mapper — Bridge giữa Domain Entity và ORM Entity
 *
 * TẠI SAO cần Mapper:
 * - Domain Entity: Pure class với Value Objects (TaskTitle, TaskStatus)
 * - ORM Entity: Có TypeORM decorators, dùng primitive types (string)
 * - Mapper convert qua lại giữa 2 worlds
 *
 * FLOW:
 * DB → ORM Entity → Mapper.toDomain() → Domain Entity → Business Logic
 * Domain Entity → Mapper.toPersistence() → ORM Entity → DB
 */
import { Task } from '../../domain/entities/task.entity';
import { TaskTitle } from '../../domain/value-objects/task-title.vo';
import { TaskStatus } from '../../domain/value-objects/task-status.vo';
import { TaskOrmEntity } from '../../infrastructure/persistence/task.orm-entity';

export class TaskMapper {
  /**
   * ORM Entity → Domain Entity
   * Reconstruct Value Objects từ primitive types trong DB
   */
  static toDomain(orm: TaskOrmEntity): Task {
    return Task.reconstitute({
      id: orm.id,
      title: TaskTitle.create(orm.title),
      description: orm.description,
      status: TaskStatus.create(orm.status),
      dueDate: orm.dueDate,
      userId: orm.userId,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  /**
   * Domain Entity → ORM Entity
   * Extract primitive values từ Value Objects để lưu DB
   */
  static toPersistence(domain: Task): Partial<TaskOrmEntity> {
    return {
      id: domain.id,
      title: domain.title.getValue(),
      description: domain.description,
      status: domain.status.getValue(),
      dueDate: domain.dueDate,
      userId: domain.userId,
    };
  }
}

/**
 * KHÁI NIỆM: Repository Adapter (Implementation)
 *
 * ADAPTER trong Hexagonal Architecture:
 * - Implement interface (Port) được định nghĩa trong Domain
 * - Chứa toàn bộ chi tiết kỹ thuật (TypeORM, SQL, QueryBuilder)
 * - Domain KHÔNG biết adapter dùng TypeORM hay Prisma hay raw SQL
 *
 * NGUYÊN TẮC:
 * - Input: nhận Domain Entity
 * - Process: Convert sang ORM Entity → query DB
 * - Output: Convert ORM Entity → Domain Entity → return
 */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../domain/entities/task.entity';
import {
  FindAllParams,
  ITaskRepository,
} from '../../domain/repositories/task.repository';
import { TaskMapper } from '../../application/mappers/task.mapper';
import { TaskOrmEntity } from './task.orm-entity';

@Injectable()
export class TaskTypeOrmRepository implements ITaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly ormRepo: Repository<TaskOrmEntity>,
  ) {}

  async save(task: Task): Promise<Task> {
    const ormData = TaskMapper.toPersistence(task);

    let saved: TaskOrmEntity;
    if (task.id) {
      await this.ormRepo.update(task.id, ormData);
      saved = await this.ormRepo.findOneOrFail({ where: { id: task.id } });
    } else {
      const entity = this.ormRepo.create(ormData as TaskOrmEntity);
      saved = await this.ormRepo.save(entity);
    }

    return TaskMapper.toDomain(saved);
  }

  async findById(id: number, userId: number): Promise<Task | null> {
    const found = await this.ormRepo.findOne({ where: { id, userId } });
    return found ? TaskMapper.toDomain(found) : null;
  }

  async findAll(params: FindAllParams): Promise<{ tasks: Task[]; total: number }> {
    const qb = this.ormRepo
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: params.userId });

    if (params.status) {
      qb.andWhere('task.status = :status', { status: params.status });
    }
    if (params.search) {
      qb.andWhere('task.title LIKE :search', { search: `%${params.search}%` });
    }

    const allowed = ['createdAt', 'title', 'status', 'dueDate'];
    const sortBy = allowed.includes(params.sortBy) ? params.sortBy : 'createdAt';
    qb.orderBy(`task.${sortBy}`, params.sortOrder);
    qb.skip((params.page - 1) * params.limit).take(params.limit);

    const [ormEntities, total] = await qb.getManyAndCount();
    const tasks = ormEntities.map(TaskMapper.toDomain);
    return { tasks, total };
  }

  async softDelete(id: number, userId: number): Promise<void> {
    const entity = await this.ormRepo.findOne({ where: { id, userId } });
    if (entity) {
      await this.ormRepo.softRemove(entity);
    }
  }
}

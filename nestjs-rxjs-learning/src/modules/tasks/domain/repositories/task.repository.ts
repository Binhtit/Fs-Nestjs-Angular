/**
 * KHÁI NIỆM: Repository Port (Interface)
 *
 * PORT trong Hexagonal Architecture:
 * - Interface định nghĩa WHAT (cần làm gì)
 * - KHÔNG định nghĩa HOW (làm bằng cách nào)
 *
 * TẠI SAO dùng interface thay vì dùng thẳng TypeORM Repository:
 * 1. DEPENDENCY INVERSION: Domain layer KHÔNG biết về TypeORM
 *    → Domain depend on interface, Infrastructure implement interface
 * 2. TESTABLE: Unit test inject MockRepository, không cần real DB
 * 3. SWAPPABLE: Đổi TypeORM → Prisma → chỉ đổi implementation
 *    Domain code KHÔNG thay đổi gì
 *
 * CONVENTION:
 * - Port đặt trong domain/ (thuộc về domain)
 * - Adapter (implementation) đặt trong infrastructure/
 */
import { Task } from '../entities/task.entity';

/**
 * ITaskRepository: Contract cho data access
 *
 * Chỉ chứa methods mà domain CẦN, không expose toàn bộ DB operations
 * Ví dụ: Không có raw SQL, không có QueryBuilder — đó là implementation details
 */
export interface ITaskRepository {
  /** Lưu task (create hoặc update) */
  save(task: Task): Promise<Task>;

  /** Tìm task theo ID + userId (ownership check) */
  findById(id: number, userId: number): Promise<Task | null>;

  /** Tìm tất cả tasks của user (có filter, pagination) */
  findAll(params: FindAllParams): Promise<{ tasks: Task[]; total: number }>;

  /** Soft delete */
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

/**
 * DI TOKEN: Dùng để inject ITaskRepository trong NestJS
 *
 * TẠI SAO cần token:
 * - TypeScript interfaces biến mất sau compile → NestJS DI không thấy
 * - Dùng string token hoặc Symbol làm identifier
 * - Module khai báo: { provide: TASK_REPOSITORY, useClass: TaskTypeOrmRepository }
 * - Service inject: @Inject(TASK_REPOSITORY) private repo: ITaskRepository
 */
export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY');

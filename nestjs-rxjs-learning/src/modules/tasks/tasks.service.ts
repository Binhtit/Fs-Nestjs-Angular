/**
 * KHÁI NIỆM: RxJS trong Service Layer
 *
 * TẠI SAO dùng RxJS ở đây (Learning Purpose):
 * - NestJS handler hỗ trợ return Observable (tự subscribe)
 * - Minh họa cách convert Promise → Observable với from()
 * - Demo pipe operators cho data transformation
 *
 * THỰC TẾ: Trong NestJS service thuần CRUD, async/await đơn giản hơn
 * RxJS phát huy sức mạnh khi:
 * - Stream data (WebSocket, SSE)
 * - Combine nhiều async operations
 * - Cancel/retry logic phức tạp
 * - Interceptors (bắt buộc dùng Observable)
 */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Repository } from 'typeorm';
import { ApiResponse, PaginationMeta } from '../../common/dto/api-response.dto';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ERROR_CODES } from '../../common/constants/error-code.constant';
import { CreateTaskDto } from './dto/create-task.dto';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskEntity } from './entities/task.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
  ) {}

  /**
   * Tạo task mới
   *
   * OPERATOR: from() → convert Promise thành Observable
   * TẠI SAO: TypeORM trả về Promise, cần convert sang Observable để dùng pipe
   *
   * OPERATOR: switchMap() → chain 2 async operations
   * Step 1: repository.save() → TaskEntity
   * Step 2: Dùng result step 1 để chạy step 2 (ở đây chỉ return)
   *
   * OPERATOR: catchError() → handle lỗi trong stream
   */
  create(dto: CreateTaskDto, userId: number): Observable<TaskEntity> {
    // BƯỚC 1: Tạo entity object (sync, chưa lưu DB)
    const task = this.taskRepository.create({
      ...dto,
      userId,
    });

    /**
     * from(Promise): Convert Promise → Observable
     * - Promise resolve → Observable emit 1 giá trị rồi complete
     * - Promise reject → Observable throw error
     *
     * TẠI SAO dùng from() thay vì new Observable():
     * - from() là shorthand cho Promise → Observable conversion
     * - new Observable() dùng khi cần custom logic (manual next/error/complete)
     */
    return from(this.taskRepository.save(task)).pipe(
      /**
       * OPERATOR: map()
       * Transform saved entity → log rồi return
       */
      map((savedTask) => {
        this.logger.log(`Task created: ${savedTask.id} by user ${userId}`);
        return savedTask;
      }),

      /**
       * OPERATOR: catchError()
       * Bắt mọi error trong pipeline → transform thành BusinessException
       */
      catchError((error: Error) => {
        this.logger.error(`Failed to create task: ${error.message}`);
        return throwError(() => new BusinessException(
          ERROR_CODES.SYSTEM_INTERNAL_ERROR.code,
          'Không thể tạo task, vui lòng thử lại',
        ));
      }),
    );
  }

  /**
   * Lấy danh sách tasks có phân trang, filter, sort
   *
   * PATTERN: QueryBuilder cho complex queries
   * TẠI SAO không dùng repository.find():
   * - find() không hỗ trợ LIKE search
   * - find() khó customize cho dynamic filters
   * - QueryBuilder linh hoạt hơn cho phức tạp
   */
  findAll(query: QueryTaskDto, userId: number): Observable<ApiResponse<TaskEntity[]>> {
    const { page, limit, sortBy, sortOrder, status, search } = query;

    const qb = this.taskRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId });

    // Dynamic filter: chỉ thêm WHERE khi có giá trị
    if (status) {
      qb.andWhere('task.status = :status', { status });
    }

    if (search) {
      qb.andWhere('task.title LIKE :search', { search: `%${search}%` });
    }

    // Whitelist sortBy để tránh SQL injection
    const allowedSortFields = ['createdAt', 'title', 'status', 'dueDate'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`task.${safeSortBy}`, sortOrder);

    // Pagination: skip + take
    qb.skip((page - 1) * limit).take(limit);

    /**
     * from(Promise) → Observable
     *
     * OPERATOR: switchMap()
     * TÁC DỤNG: Map giá trị thành Observable mới rồi subscribe
     * Ở ĐÂY: Không cần switchMap thật sự (chỉ 1 emission)
     * nhưng demo pattern cho learning purpose
     *
     * OPERATOR: map()
     * Transform raw [tasks, total] → ApiResponse with pagination
     */
    return from(qb.getManyAndCount()).pipe(
      map(([tasks, total]) => {
        const pagination: PaginationMeta = {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        };
        return ApiResponse.paginated(tasks, pagination);
      }),
    );
  }

  /** Tìm task theo ID (kiểm tra ownership) */
  findOne(id: number, userId: number): Observable<TaskEntity> {
    return from(
      this.taskRepository.findOne({ where: { id, userId } }),
    ).pipe(
      map((task) => {
        if (!task) {
          throw BusinessException.notFound(
            ERROR_CODES.TASK_NOT_FOUND.code,
            ERROR_CODES.TASK_NOT_FOUND.message,
          );
        }
        return task;
      }),
    );
  }

  /**
   * Cập nhật task
   *
   * OPERATOR: switchMap()
   * Chain 2 operations: findOne → save
   * switchMap hủy Observable trước khi subscribe cái mới
   * (trong case này chỉ có 1 emit nên giống concatMap/mergeMap)
   */
  update(id: number, dto: UpdateTaskDto, userId: number): Observable<TaskEntity> {
    return this.findOne(id, userId).pipe(
      switchMap((task) => {
        Object.assign(task, dto);
        return from(this.taskRepository.save(task));
      }),
    );
  }

  /**
   * Soft delete task
   * softDelete() set deletedAt = NOW(), không xóa row
   */
  remove(id: number, userId: number): Observable<void> {
    return this.findOne(id, userId).pipe(
      switchMap((task) => from(this.taskRepository.softRemove(task))),
      map(() => undefined),
    );
  }
}

/**
 * KHÁI NIỆM: Unit Test cho Service dùng RxJS
 *
 * TẠI SAO cần unit test:
 * 1. Confidence: Đảm bảo logic đúng khi refactor
 * 2. Documentation: Test mô tả behavior mong muốn
 * 3. Regression: Phát hiện bug sớm khi thay đổi code
 *
 * TEST RxJS Observable:
 * - lastValueFrom(): Convert Observable → Promise để dùng async/await
 * - Hoặc dùng subscribe() với done callback
 *
 * MOCK PATTERN:
 * - Mock repository để không cần real database
 * - Chỉ test business logic, không test TypeORM
 */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { TaskEntity } from './entities/task.entity';
import { TasksService } from './tasks.service';

/**
 * Mock Repository
 * Tạo object giả có cùng methods với TypeORM Repository
 * Jest mock functions cho phép kiểm tra: được gọi bao nhiêu lần, với arguments gì
 */
const mockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let repository: jest.Mocked<Partial<Repository<TaskEntity>>>;

  /**
   * beforeEach: Chạy TRƯỚC mỗi test case
   * Tạo fresh module + service instance → test không ảnh hưởng nhau
   *
   * TẠI SAO dùng Test.createTestingModule:
   * - Simulate NestJS DI container
   * - Inject mock dependencies thay vì real ones
   * - Giữ nguyên DI behavior như production
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          /**
           * getRepositoryToken(TaskEntity):
           * Lấy DI token cho Repository<TaskEntity>
           * NestJS dùng token này để inject repository vào service
           */
          provide: getRepositoryToken(TaskEntity),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    repository = module.get(getRepositoryToken(TaskEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  /**
   * TEST: create() trả về Observable emit TaskEntity
   *
   * PATTERN test RxJS:
   * 1. Mock repository methods
   * 2. Gọi service method (trả về Observable)
   * 3. lastValueFrom() convert Observable → Promise
   * 4. await + expect kết quả
   */
  describe('create', () => {
    it('should create a task and return Observable<TaskEntity>', async () => {
      const dto = { title: 'Test Task', description: 'Test' };
      const userId = 1;
      const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test',
        status: 'TODO',
        userId: 1,
      } as TaskEntity;

      // Mock repository behavior
      repository.create!.mockReturnValue(mockTask);
      repository.save!.mockResolvedValue(mockTask);

      /**
       * lastValueFrom(): Convert Observable → Promise
       * Đợi Observable complete → resolve với giá trị cuối cùng
       *
       * TẠI SAO dùng lastValueFrom thay vì subscribe:
       * - Async/await syntax quen thuộc hơn
       * - Tự handle errors (reject Promise)
       * - Jest await được → không cần done callback
       */
      const result = await lastValueFrom(service.create(dto, userId));

      expect(result).toEqual(mockTask);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        userId,
      });
      expect(repository.save).toHaveBeenCalledWith(mockTask);
    });
  });

  /**
   * TEST: findOne() throw BusinessException khi không tìm thấy
   */
  describe('findOne', () => {
    it('should return task when found', async () => {
      const mockTask = { id: 1, title: 'Found', userId: 1 } as TaskEntity;
      repository.findOne!.mockResolvedValue(mockTask);

      const result = await lastValueFrom(service.findOne(1, 1));
      expect(result).toEqual(mockTask);
    });

    it('should throw BusinessException when task not found', async () => {
      repository.findOne!.mockResolvedValue(null);

      /**
       * Test Observable error:
       * lastValueFrom() reject khi Observable throw error
       * → Dùng rejects.toThrow() để verify error type
       */
      await expect(lastValueFrom(service.findOne(999, 1))).rejects.toThrow();
    });
  });

  /**
   * TEST: update() chain findOne → save (switchMap pattern)
   */
  describe('update', () => {
    it('should update task via switchMap chain', async () => {
      const existingTask = {
        id: 1,
        title: 'Old Title',
        status: 'TODO',
        userId: 1,
      } as TaskEntity;
      const updatedTask = { ...existingTask, title: 'New Title' } as TaskEntity;

      repository.findOne!.mockResolvedValue(existingTask);
      repository.save!.mockResolvedValue(updatedTask);

      const result = await lastValueFrom(
        service.update(1, { title: 'New Title' }, 1),
      );

      expect(result.title).toBe('New Title');
      expect(repository.save).toHaveBeenCalled();
    });
  });

  /**
   * TEST: remove() soft delete
   */
  describe('remove', () => {
    it('should soft remove task', async () => {
      const mockTask = { id: 1, userId: 1 } as TaskEntity;
      repository.findOne!.mockResolvedValue(mockTask);
      repository.softRemove!.mockResolvedValue({ ...mockTask, deletedAt: new Date() } as TaskEntity);

      // remove() trả về Observable<void>
      await lastValueFrom(service.remove(1, 1));

      expect(repository.softRemove).toHaveBeenCalledWith(mockTask);
    });
  });
});

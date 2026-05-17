/**
 * KHÁI NIỆM: Domain Entity (DDD)
 *
 * DOMAIN ENTITY khác gì ORM Entity:
 * ┌──────────────────────┬────────────────────────────────┐
 * │ Domain Entity (DDD)  │ ORM Entity (TypeORM)           │
 * ├──────────────────────┼────────────────────────────────┤
 * │ PURE TypeScript      │ Có @Column, @Entity decorators │
 * │ Business rules BÊN TRONG │ Chỉ là data container       │
 * │ Dùng Value Objects   │ Dùng primitive types           │
 * │ KHÔNG import TypeORM │ Import toàn bộ TypeORM         │
 * │ Testable mà không DB │ Cần DB connection để test      │
 * └──────────────────────┴────────────────────────────────┘
 *
 * NGUYÊN TẮC: Domain Entity KHÔNG biết về:
 * - Database (TypeORM, Prisma)
 * - HTTP (Express, NestJS controllers)
 * - External services (Redis, Kafka)
 * → Chỉ chứa PURE business logic
 *
 * AGGREGATE ROOT:
 * - Task là Aggregate Root (entry point cho cụm entity liên quan)
 * - Bên ngoài CHỈ tương tác với Task, không truy cập trực tiếp sub-entities
 * - Đảm bảo invariants (business rules) luôn được enforce
 */
import { TaskTitle } from '../value-objects/task-title.vo';
import { TaskStatus } from '../value-objects/task-status.vo';

export interface TaskProps {
  id?: number;
  title: TaskTitle;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  userId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Task {
  private _id: number | undefined;
  private _title: TaskTitle;
  private _description: string | null;
  private _status: TaskStatus;
  private _dueDate: Date | null;
  private readonly _userId: number;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: TaskProps) {
    this._id = props.id;
    this._title = props.title;
    this._description = props.description;
    this._status = props.status;
    this._dueDate = props.dueDate;
    this._userId = props.userId;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Factory method: Tạo Task mới
   * Validate business rules ngay khi tạo
   */
  static create(
    title: string,
    userId: number,
    description?: string | null,
    dueDate?: Date | null,
  ): Task {
    return new Task({
      title: TaskTitle.create(title),
      description: description ?? null,
      status: TaskStatus.todo(),
      dueDate: dueDate ?? null,
      userId,
    });
  }

  /**
   * Reconstitute: Tái tạo Task từ persistence (DB)
   * KHÔNG validate lại (data từ DB đã valid)
   */
  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  // === GETTERS (read-only access) ===
  get id(): number | undefined { return this._id; }
  get title(): TaskTitle { return this._title; }
  get description(): string | null { return this._description; }
  get status(): TaskStatus { return this._status; }
  get dueDate(): Date | null { return this._dueDate; }
  get userId(): number { return this._userId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  // === BUSINESS METHODS ===
  // Mọi thay đổi state ĐI QUA methods → enforce business rules

  /**
   * Đổi tiêu đề: Validate qua TaskTitle Value Object
   */
  changeTitle(newTitle: string): void {
    this._title = TaskTitle.create(newTitle);
    this._updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  /**
   * Chuyển trạng thái: Delegate cho TaskStatus.transitionTo()
   * → State machine rules được enforce tự động
   *
   * VÍ DỤ: task.changeStatus('DONE')
   * - Nếu task đang TODO → throw Error (phải qua IN_PROGRESS trước)
   * - Nếu task đang IN_PROGRESS → OK
   */
  changeStatus(newStatus: string): void {
    this._status = this._status.transitionTo(newStatus as any);
    this._updatedAt = new Date();
  }

  /**
   * Mark as completed: Shortcut + business logic
   * Chỉ cho phép khi task đang IN_PROGRESS
   */
  complete(): void {
    this._status = this._status.transitionTo('DONE');
    this._updatedAt = new Date();
  }

  /** Check xem task có quá hạn không */
  isOverdue(): boolean {
    if (!this._dueDate) return false;
    return new Date() > this._dueDate && !this._status.isFinal();
  }

  /** Assign ID sau khi persist (DB generate ID) */
  assignId(id: number): void {
    if (this._id !== undefined) {
      throw new Error('Task đã có ID, không thể assign lại');
    }
    this._id = id;
  }
}

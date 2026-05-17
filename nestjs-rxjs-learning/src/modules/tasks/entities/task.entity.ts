/**
 * Task Entity - Quan hệ ManyToOne với User + Soft Delete
 */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { TaskStatus } from '../../../common/enums/task-status.enum';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('tasks')
export class TaskEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /**
   * @Column({ default: 'TODO' })
   * Task mới mặc định ở trạng thái TODO
   */
  @Column({ type: 'text', default: 'TODO' })
  status: TaskStatus;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date | null;

  /**
   * @ManyToOne(() => UserEntity, (user) => user.tasks)
   *
   * Quan hệ N-1: Nhiều Tasks thuộc về 1 User
   * ManyToOne TẠO column "userId" trong bảng tasks
   * (OneToMany phía User KHÔNG tạo column)
   *
   * eager: false (default) → không auto-load user khi query task
   * onDelete: 'CASCADE' → xóa user → xóa tất cả tasks của user
   */
  @ManyToOne(() => UserEntity, (user) => user.tasks, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * @DeleteDateColumn() → SOFT DELETE
   *
   * TẠI SAO dùng Soft Delete:
   * 1. Recovery: Khôi phục data đã "xóa" dễ dàng
   * 2. Audit: Biết data nào đã bị xóa, khi nào
   * 3. Relations: Không break foreign key constraints
   *
   * CÁCH HOẠT ĐỘNG:
   * - softDelete(): Set deletedAt = NOW(), không xóa row
   * - find() tự động filter WHERE deletedAt IS NULL
   * - withDeleted(): Include soft-deleted rows
   * - restore(): Set deletedAt = NULL
   */
  @DeleteDateColumn()
  deletedAt: Date | null;
}

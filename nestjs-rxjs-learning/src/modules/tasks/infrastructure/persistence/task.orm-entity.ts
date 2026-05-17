/**
 * ORM Entity — Infrastructure layer
 *
 * Đây là TypeORM entity (có decorators), TÁCH BIỆT khỏi Domain Entity.
 * Chỉ dùng cho persistence, KHÔNG chứa business logic.
 * Domain Entity là nguồn sự thật cho business rules.
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
import { UserEntity } from '../../../users/entities/user.entity';

@Entity('tasks')
export class TaskOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'text', default: 'TODO' })
  status: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate: Date | null;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;

  @Column()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

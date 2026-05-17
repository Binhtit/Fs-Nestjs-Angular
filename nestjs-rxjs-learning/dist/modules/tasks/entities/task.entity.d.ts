import type { TaskStatus } from '../../../common/enums/task-status.enum';
import { UserEntity } from '../../users/entities/user.entity';
export declare class TaskEntity {
    id: number;
    title: string;
    description: string | null;
    status: TaskStatus;
    dueDate: Date | null;
    user: UserEntity;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

import { UserEntity } from '../../../users/entities/user.entity';
export declare class TaskOrmEntity {
    id: number;
    title: string;
    description: string | null;
    status: string;
    dueDate: Date | null;
    user: UserEntity;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

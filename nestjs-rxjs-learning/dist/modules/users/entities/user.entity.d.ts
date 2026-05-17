import type { UserRole } from '../../../common/enums/role.enum';
import type { TaskEntity } from '../../tasks/entities/task.entity';
export declare class UserEntity {
    id: number;
    email: string;
    password: string;
    name: string;
    role: UserRole;
    refreshToken: string | null;
    createdAt: Date;
    updatedAt: Date;
    tasks: TaskEntity[];
}

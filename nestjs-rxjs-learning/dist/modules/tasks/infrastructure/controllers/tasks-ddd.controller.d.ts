import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateTaskDto } from '../../dto/create-task.dto';
import { UpdateTaskDto } from '../../dto/update-task.dto';
import { QueryTaskDto } from '../../dto/query-task.dto';
export declare class TasksDddController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTaskDto, userId: number): Promise<{
        id: number | undefined;
        title: string;
        description: string | null;
        status: import("../../domain/value-objects/task-status.vo").TaskStatusType;
        dueDate: Date | null;
        userId: number;
        isOverdue: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(query: QueryTaskDto, userId: number): Promise<{
        tasks: any;
        total: any;
        page: number;
        limit: number;
    }>;
    findOne(id: number, userId: number): Promise<{
        id: number | undefined;
        title: string;
        description: string | null;
        status: import("../../domain/value-objects/task-status.vo").TaskStatusType;
        dueDate: Date | null;
        userId: number;
        isOverdue: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, dto: UpdateTaskDto, userId: number): Promise<{
        id: number | undefined;
        title: string;
        description: string | null;
        status: import("../../domain/value-objects/task-status.vo").TaskStatusType;
        dueDate: Date | null;
        userId: number;
        isOverdue: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number, userId: number): Promise<{
        deleted: boolean;
    }>;
    private toResponse;
}

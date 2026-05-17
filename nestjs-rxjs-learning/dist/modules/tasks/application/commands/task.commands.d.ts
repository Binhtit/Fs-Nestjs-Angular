import { ICommand } from '@nestjs/cqrs';
export declare class CreateTaskCommand implements ICommand {
    readonly title: string;
    readonly userId: number;
    readonly description?: string | null | undefined;
    readonly dueDate?: string | null | undefined;
    constructor(title: string, userId: number, description?: string | null | undefined, dueDate?: string | null | undefined);
}
export declare class UpdateTaskCommand implements ICommand {
    readonly taskId: number;
    readonly userId: number;
    readonly title?: string | undefined;
    readonly description?: string | null | undefined;
    readonly status?: string | undefined;
    constructor(taskId: number, userId: number, title?: string | undefined, description?: string | null | undefined, status?: string | undefined);
}
export declare class DeleteTaskCommand implements ICommand {
    readonly taskId: number;
    readonly userId: number;
    constructor(taskId: number, userId: number);
}

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
export declare class Task {
    private _id;
    private _title;
    private _description;
    private _status;
    private _dueDate;
    private readonly _userId;
    private _createdAt;
    private _updatedAt;
    private constructor();
    static create(title: string, userId: number, description?: string | null, dueDate?: Date | null): Task;
    static reconstitute(props: TaskProps): Task;
    get id(): number | undefined;
    get title(): TaskTitle;
    get description(): string | null;
    get status(): TaskStatus;
    get dueDate(): Date | null;
    get userId(): number;
    get createdAt(): Date;
    get updatedAt(): Date;
    changeTitle(newTitle: string): void;
    updateDescription(description: string | null): void;
    changeStatus(newStatus: string): void;
    complete(): void;
    isOverdue(): boolean;
    assignId(id: number): void;
}

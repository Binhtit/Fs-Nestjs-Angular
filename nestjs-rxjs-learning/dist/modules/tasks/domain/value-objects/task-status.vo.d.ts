export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export declare class TaskStatus {
    private readonly value;
    private constructor();
    static create(status: string): TaskStatus;
    static todo(): TaskStatus;
    static inProgress(): TaskStatus;
    static done(): TaskStatus;
    transitionTo(newStatus: TaskStatusType): TaskStatus;
    isCompleted(): boolean;
    isFinal(): boolean;
    getValue(): TaskStatusType;
    equals(other: TaskStatus): boolean;
    toString(): string;
}

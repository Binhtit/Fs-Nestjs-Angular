export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';
export declare const TASK_STATUSES: {
    readonly TODO: TaskStatus;
    readonly IN_PROGRESS: TaskStatus;
    readonly DONE: TaskStatus;
    readonly CANCELLED: TaskStatus;
};
export declare const TASK_STATUS_VALUES: TaskStatus[];

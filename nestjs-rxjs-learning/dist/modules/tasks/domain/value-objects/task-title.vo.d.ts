export declare class TaskTitle {
    private readonly value;
    private constructor();
    static create(title: string): TaskTitle;
    getValue(): string;
    equals(other: TaskTitle): boolean;
    toString(): string;
}

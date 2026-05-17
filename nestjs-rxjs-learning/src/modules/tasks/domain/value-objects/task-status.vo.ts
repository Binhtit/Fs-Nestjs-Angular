/**
 * KHÁI NIỆM: Value Object — Task Status với State Machine
 *
 * NÂNG CAO: Status không chỉ là string, mà là STATE MACHINE
 * có quy tắc chuyển trạng thái:
 *
 * TODO → IN_PROGRESS → DONE
 * TODO → CANCELLED
 * IN_PROGRESS → TODO (cho phép revert)
 * IN_PROGRESS → CANCELLED
 * DONE → (không cho phép chuyển đi đâu — final state)
 * CANCELLED → (không cho phép chuyển đi đâu — final state)
 *
 * TẠI SAO dùng Value Object cho Status:
 * - Plain string: bất kỳ ai cũng set 'DONE' → 'TODO' (vi phạm business rule)
 * - TaskStatus: enforce transition rules → không thể có trạng thái bất hợp lệ
 */

/** Các trạng thái hợp lệ */
export type TaskStatusType = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

/** Ma trận chuyển trạng thái: từ status A → có thể đến [B, C, ...] */
const VALID_TRANSITIONS: Record<TaskStatusType, TaskStatusType[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['TODO', 'DONE', 'CANCELLED'],
  DONE: [],         // Final state
  CANCELLED: [],    // Final state
};

export class TaskStatus {
  private constructor(private readonly value: TaskStatusType) {
    Object.freeze(this);
  }

  /** Factory: Tạo từ string (validate) */
  static create(status: string): TaskStatus {
    if (!['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(status)) {
      throw new Error(`Status "${status}" không hợp lệ`);
    }
    return new TaskStatus(status as TaskStatusType);
  }

  /** Shortcut factories */
  static todo(): TaskStatus {
    return new TaskStatus('TODO');
  }

  static inProgress(): TaskStatus {
    return new TaskStatus('IN_PROGRESS');
  }

  static done(): TaskStatus {
    return new TaskStatus('DONE');
  }

  /**
   * Chuyển trạng thái: Validate transition rule
   * Throw error nếu transition không hợp lệ
   */
  transitionTo(newStatus: TaskStatusType): TaskStatus {
    const allowed = VALID_TRANSITIONS[this.value];
    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Không thể chuyển từ "${this.value}" sang "${newStatus}". ` +
        `Cho phép: [${allowed.join(', ') || 'không có (final state)'}]`,
      );
    }
    return TaskStatus.create(newStatus);
  }

  /** Check trạng thái */
  isCompleted(): boolean {
    return this.value === 'DONE';
  }

  isFinal(): boolean {
    return this.value === 'DONE' || this.value === 'CANCELLED';
  }

  getValue(): TaskStatusType {
    return this.value;
  }

  equals(other: TaskStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

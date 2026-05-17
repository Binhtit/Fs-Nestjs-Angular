/**
 * KHÁI NIỆM: Task Status State Machine
 *
 * TẠI SAO cần định nghĩa status rõ ràng:
 * 1. Validation: Chỉ cho phép status hợp lệ, reject giá trị bậy
 * 2. State transitions: Có thể enforce TODO → IN_PROGRESS → DONE
 * 3. Frontend: Hiển thị badge/color dựa trên status
 * 4. Query: Filter tasks theo status dễ dàng
 *
 * STATE MACHINE:
 * TODO → IN_PROGRESS → DONE
 *   ↓         ↓
 * CANCELLED  CANCELLED
 */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

/**
 * Object chứa giá trị status để dùng ở runtime
 * (TypeScript type biến mất sau compile, cần object thật)
 */
export const TASK_STATUSES = {
  TODO: 'TODO' as TaskStatus,
  IN_PROGRESS: 'IN_PROGRESS' as TaskStatus,
  DONE: 'DONE' as TaskStatus,
  CANCELLED: 'CANCELLED' as TaskStatus,
} as const;

/**
 * Danh sách tất cả status values
 * Dùng cho validation: @IsIn(TASK_STATUS_VALUES)
 */
export const TASK_STATUS_VALUES: TaskStatus[] = [
  TASK_STATUSES.TODO,
  TASK_STATUSES.IN_PROGRESS,
  TASK_STATUSES.DONE,
  TASK_STATUSES.CANCELLED,
];

/**
 * Task Model — Match backend response
 *
 * QUAN TRỌNG: Interface phải MATCH CHÍNH XÁC
 * với response JSON từ NestJS backend
 *
 * Backend trả về:
 * { id, title, description, status, dueDate, userId, isOverdue, createdAt, updatedAt }
 */

/** Trạng thái task (match backend DDD Value Object) */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

/** Interface cho Task entity */
export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string | null;
  userId: number;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

/** DTO gửi lên khi tạo task */
export interface CreateTaskDto {
  title: string;
  description?: string;
  dueDate?: string;
}

/** DTO gửi lên khi update task */
export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string | null; // Có thể set lại hoặc xóa ngày hạn (null = xóa)
}

/** Params cho query (filter, pagination) */
export interface TaskQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  status?: TaskStatus;
  search?: string;
}

/**
 * Ma trận chuyển trạng thái hợp lệ (match backend DDD state machine)
 * Dùng để chỉ hiện các status buttons hợp lệ trên UI
 */
export const VALID_STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['TODO', 'DONE', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

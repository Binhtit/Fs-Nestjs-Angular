/**
 * KHÁI NIỆM: CQRS Commands
 *
 * COMMAND là gì:
 * - Object mô tả HÀNH ĐỘNG muốn thực hiện (imperative: "Create!", "Update!")
 * - Chứa TẤT CẢ data cần thiết để thực hiện hành động
 * - KHÔNG có logic, chỉ là data container
 *
 * CQRS (Command Query Responsibility Segregation):
 * - COMMAND: Write (thay đổi state) → return void hoặc ID
 * - QUERY: Read (đọc state) → return data, KHÔNG thay đổi state
 *
 * TẠI SAO tách Command/Query:
 * 1. SCALE riêng: Read thường nhiều hơn Write → scale read riêng
 * 2. OPTIMIZE riêng: Read dùng cache/denormalized view, Write dùng normalized DB
 * 3. SECURITY: Command cần authorization, Query có thể cache
 */
import { ICommand } from '@nestjs/cqrs';

export class CreateTaskCommand implements ICommand {
  constructor(
    public readonly title: string,
    public readonly userId: number,
    public readonly description?: string | null,
    public readonly dueDate?: string | null,
  ) {}
}

export class UpdateTaskCommand implements ICommand {
  constructor(
    public readonly taskId: number,
    public readonly userId: number,
    public readonly title?: string,
    public readonly description?: string | null,
    public readonly status?: string,
  ) {}
}

export class DeleteTaskCommand implements ICommand {
  constructor(
    public readonly taskId: number,
    public readonly userId: number,
  ) {}
}

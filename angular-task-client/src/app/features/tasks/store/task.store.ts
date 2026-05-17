/**
 * KHÁI NIỆM: Signal-based Store
 *
 * PATTERN: "Signals for State, RxJS for Streams"
 *
 * Store chứa STATE (signal) và ACTIONS (methods):
 * - signal() cho state → sync, no subscription
 * - computed() cho derived state → auto-track
 * - RxJS chỉ cho API calls (async)
 *
 * SO SÁNH:
 * ┌──────────────────┬─────────────────┬───────────────────┐
 * │                  │ BehaviorSubject │ Signal            │
 * ├──────────────────┼─────────────────┼───────────────────┤
 * │ Đọc giá trị     │ .getValue()     │ signal()          │
 * │ Cập nhật         │ .next(value)    │ .set(value)       │
 * │ Subscribe        │ CẦN + cleanup   │ KHÔNG cần         │
 * │ Template         │ | async pipe    │ Trực tiếp signal()│
 * │ Memory leak risk │ CÓ              │ KHÔNG             │
 * └──────────────────┴─────────────────┴───────────────────┘
 */
import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskStatus } from '@core/models/task.model';
import { TaskService } from '../services/task.service';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  /** === STATE (Signals) === */
  tasks = signal<Task[]>([]);
  selectedTask = signal<Task | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  totalCount = signal(0);
  currentPage = signal(1);
  pageSize = signal(10);
  searchTerm = signal('');
  statusFilter = signal<TaskStatus | ''>('');

  /** === DERIVED STATE (Computed) — có guard Array.isArray phòng bug BE === */
  todoCount = computed(() => this.tasks().filter((t) => t.status === 'TODO').length);
  progressCount = computed(() => this.tasks().filter((t) => t.status === 'IN_PROGRESS').length);
  doneCount = computed(() => this.tasks().filter((t) => t.status === 'DONE').length);
  totalPages = computed(() => Math.ceil(this.totalCount() / this.pageSize()));
  isEmpty = computed(() => this.tasks().length === 0 && !this.loading());

  constructor(private taskService: TaskService) {}

  /** === ACTIONS (RxJS cho async) === */

  /** Load tasks từ API */
  loadTasks(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: Record<string, string | number> = {
      page: this.currentPage(),
      limit: this.pageSize(),
    };
    if (this.searchTerm()) params['search'] = this.searchTerm();
    if (this.statusFilter()) params['status'] = this.statusFilter();

    /**
     * RxJS subscribe → tap data vào Signal
     * Đây là "bridge" giữa RxJS (async) và Signal (sync state)
     */
    this.taskService.getAll(params).subscribe({
      next: (result) => {
        this.tasks.set(result.items);
        this.totalCount.set(result.pagination.total);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Lỗi tải danh sách tasks');
        this.loading.set(false);
      },
    });
  }

  /** Tạo task mới */
  createTask(data: { title: string; description?: string }): void {
    this.taskService.create(data).subscribe({
      next: () => this.loadTasks(), // Reload list
      error: (err) => this.error.set(err.error?.message ?? 'Lỗi tạo task'),
    });
  }

  /** Update task */
  updateTask(id: number, data: Partial<Task>): void {
    this.taskService.update(id, data).subscribe({
      next: (updated) => {
        /** Optimistic-like: update local state ngay */
        this.tasks.update((list) =>
          list.map((t) => (t.id === id ? updated : t)),
        );
        if (this.selectedTask()?.id === id) {
          this.selectedTask.set(updated);
        }
      },
      error: (err) => this.error.set(err.error?.message ?? 'Lỗi cập nhật'),
    });
  }

  /** Delete task */
  deleteTask(id: number): void {
    this.taskService.delete(id).subscribe({
      next: () => {
        this.tasks.update((list) => list.filter((t) => t.id !== id));
        this.totalCount.update((c) => c - 1);
      },
      error: (err) => this.error.set(err.error?.message ?? 'Lỗi xóa task'),
    });
  }

  /** Load single task */
  loadTask(id: number): void {
    this.loading.set(true);
    this.taskService.getById(id).subscribe({
      next: (task) => {
        this.selectedTask.set(task);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message ?? 'Không tìm thấy task');
        this.loading.set(false);
      },
    });
  }

  /** Set filters */
  setSearch(term: string): void {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.loadTasks();
  }

  setStatusFilter(status: TaskStatus | ''): void {
    this.statusFilter.set(status);
    this.currentPage.set(1);
    this.loadTasks();
  }

  setPage(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }
}

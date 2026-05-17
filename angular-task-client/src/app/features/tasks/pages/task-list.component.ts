/**
 * Task List Page — RxJS Search + Signal State
 *
 * RxJS PATTERNS TRONG COMPONENT:
 * 1. debounceTime(300): Đợi user ngừng gõ 300ms rồi mới search
 * 2. distinctUntilChanged: Không search lại nếu query giống cũ
 * 3. takeUntilDestroyed: Auto-unsubscribe khi component destroy
 *
 * SIGNAL PATTERNS:
 * - Template đọc store.tasks() trực tiếp (không cần async pipe)
 * - store.loading(), store.isEmpty() → reactive UI states
 */
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TaskStore } from '../store/task.store';
import { Task, TaskStatus, VALID_STATUS_TRANSITIONS } from '@core/models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="task-list-page">
      <div class="header">
        <h1>📋 Tasks</h1>
        <button class="btn-create" (click)="showCreateForm = !showCreateForm">
          {{ showCreateForm ? '✕ Đóng' : '＋ Tạo mới' }}
        </button>
      </div>

      <!-- Create Form -->
      @if (showCreateForm) {
        <div class="create-form">
          <input [(ngModel)]="newTitle" placeholder="Tiêu đề task..." class="input" />
          <input [(ngModel)]="newDesc" placeholder="Mô tả (tùy chọn)" class="input" />
          <button class="btn-primary" (click)="onCreate()" [disabled]="!newTitle.trim()">
            Tạo
          </button>
        </div>
      }

      <!-- Filters -->
      <div class="filters">
        <input
          class="search-input"
          placeholder="🔍 Tìm kiếm..."
          (input)="onSearchInput($event)"
        />
        <div class="status-filters">
          <button [class.active]="store.statusFilter() === ''" (click)="store.setStatusFilter('')">Tất cả</button>
          <button [class.active]="store.statusFilter() === 'TODO'" (click)="store.setStatusFilter('TODO')">📝 TODO</button>
          <button [class.active]="store.statusFilter() === 'IN_PROGRESS'" (click)="store.setStatusFilter('IN_PROGRESS')">🔄 Đang làm</button>
          <button [class.active]="store.statusFilter() === 'DONE'" (click)="store.setStatusFilter('DONE')">✅ Hoàn thành</button>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats">
        <span class="stat todo">📝 {{ store.todoCount() }}</span>
        <span class="stat progress">🔄 {{ store.progressCount() }}</span>
        <span class="stat done">✅ {{ store.doneCount() }}</span>
        <span class="stat total">Tổng: {{ store.totalCount() }}</span>
      </div>

      <!-- Loading -->
      @if (store.loading()) {
        <div class="loading">⏳ Đang tải...</div>
      }

      <!-- Error -->
      @if (store.error()) {
        <div class="error-banner">{{ store.error() }}</div>
      }

      <!-- Empty -->
      @if (store.isEmpty()) {
        <div class="empty">📭 Chưa có task nào</div>
      }

      <!-- Task Cards -->
      <div class="task-grid">
        @for (task of store.tasks(); track task.id) {
          <div class="task-card" [class]="'status-' + task.status.toLowerCase()">
            <div class="card-header">
              <h3>{{ task.title }}</h3>
              <span class="badge">{{ task.status }}</span>
            </div>
            @if (task.description) {
              <p class="desc">{{ task.description }}</p>
            }
            <div class="card-footer">
              <span class="date">{{ task.createdAt | date:'short' }}</span>
              <div class="actions">
                @for (s of getValidTransitions(task.status); track s) {
                  <button class="btn-sm" (click)="onStatusChange(task.id, s)">
                    → {{ s }}
                  </button>
                }
                <button class="btn-sm btn-delete" (click)="onDelete(task.id)">🗑️</button>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (store.totalPages() > 1) {
        <div class="pagination">
          <button [disabled]="store.currentPage() <= 1" (click)="store.setPage(store.currentPage() - 1)">← Trước</button>
          <span>Trang {{ store.currentPage() }} / {{ store.totalPages() }}</span>
          <button [disabled]="store.currentPage() >= store.totalPages()" (click)="store.setPage(store.currentPage() + 1)">Sau →</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .task-list-page { max-width: 900px; margin: 0 auto; padding: 24px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    h1 { margin: 0; color: #e0e0e0; }
    .btn-create {
      padding: 10px 20px; border: 1px solid #6c63ff; border-radius: 8px;
      background: transparent; color: #6c63ff; cursor: pointer; font-size: 14px;
    }
    .btn-create:hover { background: rgba(108,99,255,0.1); }
    .create-form {
      display: flex; gap: 8px; margin-bottom: 16px; padding: 16px;
      background: rgba(255,255,255,0.05); border-radius: 8px;
    }
    .input {
      flex: 1; padding: 10px; border: 1px solid rgba(255,255,255,0.2);
      border-radius: 6px; background: rgba(255,255,255,0.05); color: #fff;
    }
    .btn-primary {
      padding: 10px 20px; border: none; border-radius: 6px;
      background: #6c63ff; color: #fff; cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.4; }
    .filters { margin-bottom: 16px; }
    .search-input {
      width: 100%; padding: 12px; border: 1px solid rgba(255,255,255,0.15);
      border-radius: 8px; background: rgba(255,255,255,0.05); color: #fff;
      margin-bottom: 8px; box-sizing: border-box; font-size: 14px;
    }
    .status-filters { display: flex; gap: 8px; }
    .status-filters button {
      padding: 6px 14px; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px;
      background: transparent; color: #aaa; cursor: pointer; font-size: 13px;
    }
    .status-filters button.active { background: #6c63ff; color: #fff; border-color: #6c63ff; }
    .stats { display: flex; gap: 16px; margin-bottom: 16px; }
    .stat { font-size: 14px; color: #aaa; }
    .loading, .empty { text-align: center; padding: 40px; color: #888; }
    .error-banner {
      background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.2);
      padding: 12px; border-radius: 8px; color: #ff6b6b; margin-bottom: 12px;
    }
    .task-grid { display: grid; gap: 12px; }
    .task-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 16px; transition: border-color 0.2s;
    }
    .task-card:hover { border-color: rgba(108,99,255,0.4); }
    .task-card.status-in_progress { border-left: 3px solid #f59e0b; }
    .task-card.status-done { border-left: 3px solid #10b981; opacity: 0.7; }
    .task-card.status-cancelled { border-left: 3px solid #ef4444; opacity: 0.5; }
    .card-header { display: flex; justify-content: space-between; align-items: center; }
    .card-header h3 { margin: 0; color: #e0e0e0; font-size: 16px; }
    .badge {
      font-size: 11px; padding: 4px 10px; border-radius: 12px;
      background: rgba(108,99,255,0.2); color: #a5b4fc;
    }
    .desc { color: #888; font-size: 14px; margin: 8px 0; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
    .date { font-size: 12px; color: #666; }
    .actions { display: flex; gap: 6px; }
    .btn-sm {
      padding: 4px 10px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      background: transparent; color: #aaa; cursor: pointer; font-size: 11px;
    }
    .btn-sm:hover { background: rgba(108,99,255,0.15); color: #fff; }
    .btn-delete:hover { background: rgba(255,0,0,0.15); color: #ff6b6b; }
    .pagination { display: flex; justify-content: center; gap: 16px; margin-top: 24px; align-items: center; color: #aaa; }
    .pagination button {
      padding: 8px 16px; border: 1px solid rgba(255,255,255,0.15); border-radius: 6px;
      background: transparent; color: #aaa; cursor: pointer;
    }
    .pagination button:disabled { opacity: 0.3; }
  `],
})
export class TaskListComponent implements OnInit {
  store = inject(TaskStore);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  showCreateForm = false;
  newTitle = '';
  newDesc = '';

  /**
   * RxJS: Search với debounceTime
   * Subject → pipe(debounceTime, distinctUntilChanged) → store.setSearch
   *
   * takeUntilDestroyed: Auto-unsubscribe khi component destroy
   * → KHÔNG cần ngOnDestroy + manual unsubscribe
   */
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.store.loadTasks();

    this.searchSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((term) => this.store.setSearch(term));
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onCreate(): void {
    if (!this.newTitle.trim()) return;
    this.store.createTask({ title: this.newTitle, description: this.newDesc || undefined });
    this.newTitle = '';
    this.newDesc = '';
    this.showCreateForm = false;
  }

  onStatusChange(id: number, status: TaskStatus): void {
    this.store.updateTask(id, { status } as Partial<Task>);
  }

  onDelete(id: number): void {
    if (confirm('Xác nhận xóa task?')) {
      this.store.deleteTask(id);
    }
  }

  getValidTransitions(status: TaskStatus): TaskStatus[] {
    return VALID_STATUS_TRANSITIONS[status];
  }
}

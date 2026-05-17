/**
 * Dashboard Page
 *
 * RxJS PATTERNS:
 * 1. forkJoin: Đợi TẤT CẢ API calls hoàn thành rồi render
 * 2. timer + switchMap: Polling health check mỗi 30 giây
 * 3. takeUntilDestroyed: Auto-cleanup polling
 */
import { Component, OnInit, signal, inject, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { timer, switchMap, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '@env';
import { TaskStore } from '@features/tasks/store/task.store';
import { AuthService } from '@features/auth/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="page">
      <h1>🏠 Dashboard</h1>
      <p class="welcome">
        Xin chào, <strong>{{ authService.currentUser()?.name ?? 'Guest' }}</strong>
      </p>

      <!-- Health Check -->
      <div class="section">
        <h2>💚 Server Health</h2>
        <div class="health-card" [class.healthy]="healthStatus() === 'ok'">
          <span class="dot"></span>
          {{ healthStatus() === 'ok' ? '✅ Online' : '🔴 Offline' }}
          <small>(auto-refresh mỗi 30s)</small>
        </div>
      </div>

      <!-- Task Stats -->
      <div class="section">
        <h2>📊 Task Stats</h2>
        <div class="stats-grid">
          <div class="stat-card todo">
            <span class="number">{{ taskStore.todoCount() }}</span>
            <span class="label">📝 TODO</span>
          </div>
          <div class="stat-card progress">
            <span class="number">{{ taskStore.progressCount() }}</span>
            <span class="label">🔄 In Progress</span>
          </div>
          <div class="stat-card done">
            <span class="number">{{ taskStore.doneCount() }}</span>
            <span class="label">✅ Done</span>
          </div>
          <div class="stat-card total">
            <span class="number">{{ taskStore.totalCount() }}</span>
            <span class="label">📁 Tổng</span>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div class="section">
        <h2>🔗 Quick Links</h2>
        <div class="links">
          <a routerLink="/tasks" class="link-card">📋 Tasks</a>
          <a routerLink="/rxjs" class="link-card">🧪 RxJS Learning</a>
          <a routerLink="/messaging" class="link-card">📡 Messaging</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 24px; }
    h1 { color: #e0e0e0; margin: 0 0 8px; }
    .welcome { color: #aaa; margin-bottom: 32px; }
    .section { margin-bottom: 32px; }
    h2 { color: #c0c0c0; margin: 0 0 16px; font-size: 18px; }
    .health-card {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 12px 20px; background: rgba(255,0,0,0.1);
      border: 1px solid rgba(255,0,0,0.2); border-radius: 12px; color: #ff6b6b;
    }
    .health-card.healthy { background: rgba(16,185,129,0.1); border-color: rgba(16,185,129,0.2); color: #10b981; }
    .health-card small { color: #666; margin-left: 8px; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .stat-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; padding: 20px; text-align: center;
    }
    .number { display: block; font-size: 32px; font-weight: 700; color: #e0e0e0; }
    .label { display: block; margin-top: 8px; color: #888; font-size: 13px; }
    .stat-card.todo { border-top: 3px solid #3b82f6; }
    .stat-card.progress { border-top: 3px solid #f59e0b; }
    .stat-card.done { border-top: 3px solid #10b981; }
    .stat-card.total { border-top: 3px solid #8b5cf6; }
    .links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .link-card {
      display: block; padding: 20px; text-align: center; background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;
      color: #a5b4fc; text-decoration: none; font-size: 15px; transition: all 0.2s;
    }
    .link-card:hover { background: rgba(108,99,255,0.15); border-color: #6c63ff; }
    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .links { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private http = inject(HttpClient);
  private destroyRef = inject(DestroyRef);
  taskStore = inject(TaskStore);
  authService = inject(AuthService);

  healthStatus = signal<string>('unknown');

  ngOnInit(): void {
    /** Load tasks for stats */
    this.taskStore.loadTasks();

    /**
     * RxJS: timer(0, 30000) — emit ngay lập tức, rồi mỗi 30 giây
     * switchMap: Mỗi lần timer emit → gọi health API
     * catchError: Server down → return 'error' thay vì crash
     * takeUntilDestroyed: Auto-stop khi navigate đi
     */
    timer(0, 30000)
      .pipe(
        switchMap(() =>
          this.http.get<{ status: string }>(`${environment.apiUrl}/../health`).pipe(
            map((res) => res.status),
            catchError(() => of('error')),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((status) => this.healthStatus.set(status));
  }
}

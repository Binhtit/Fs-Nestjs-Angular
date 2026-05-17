/**
 * RxJS Learning Page
 *
 * RxJS PATTERN: toSignal() — Bridge Observable → Signal
 * - Consume async data trong template KHÔNG cần async pipe
 * - Angular 2025 best practice
 */
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RxjsService, Lesson } from '../services/rxjs.service';

@Component({
  selector: 'app-rxjs-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>🧪 RxJS Learning Lab</h1>
      <p class="subtitle">9 bài học từ NestJS backend, giải thích concepts + code</p>

      <div class="lessons">
        @for (item of lessonList; track item.path) {
          <div class="lesson-card">
            <div class="lesson-header" (click)="toggleLesson(item.path)">
              <h3>{{ item.label }}</h3>
              <span>{{ expandedLesson() === item.path ? '▼' : '▶' }}</span>
            </div>

            @if (expandedLesson() === item.path) {
              @if (lessonData()[item.path]; as lesson) {
                <div class="lesson-body">
                  <div class="section">
                    <h4>📖 Giải thích</h4>
                    <pre class="explanation">{{ lesson.explanation }}</pre>
                  </div>
                  <div class="section">
                    <h4>💻 Code Example</h4>
                    <pre class="code">{{ lesson.codeExample }}</pre>
                  </div>
                  <div class="section">
                    <h4>✅ Best Practices</h4>
                    <ul>
                      @for (bp of lesson.bestPractices; track bp) {
                        <li>{{ bp }}</li>
                      }
                    </ul>
                  </div>
                </div>
              } @else {
                <div class="loading">⏳ Đang tải...</div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 24px; }
    h1 { color: #e0e0e0; margin: 0 0 8px; }
    .subtitle { color: #888; margin-bottom: 24px; }
    .lessons { display: grid; gap: 12px; }
    .lesson-card {
      background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px; overflow: hidden;
    }
    .lesson-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; cursor: pointer; color: #e0e0e0;
    }
    .lesson-header:hover { background: rgba(108,99,255,0.1); }
    .lesson-header h3 { margin: 0; font-size: 15px; }
    .lesson-body { padding: 0 20px 20px; }
    .section { margin-bottom: 16px; }
    h4 { color: #a5b4fc; margin: 0 0 8px; font-size: 14px; }
    .explanation {
      color: #aaa; font-size: 13px; white-space: pre-wrap;
      background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;
    }
    .code {
      background: rgba(0,0,0,0.3); color: #10b981; padding: 12px;
      border-radius: 8px; font-size: 12px; overflow-x: auto;
    }
    ul { color: #aaa; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 13px; }
    .loading { text-align: center; padding: 20px; color: #888; }
  `],
})
export class RxjsListComponent {
  private rxjsService = inject(RxjsService);

  lessonList = this.rxjsService.getLessonList();
  expandedLesson = signal<string | null>(null);
  lessonData = signal<Record<string, Lesson>>({});

  toggleLesson(path: string): void {
    if (this.expandedLesson() === path) {
      this.expandedLesson.set(null);
      return;
    }

    this.expandedLesson.set(path);

    /** Chỉ gọi API khi chưa có data (lazy load) */
    if (!this.lessonData()[path]) {
      this.rxjsService.getLesson(path).subscribe((lesson) => {
        this.lessonData.update((data) => ({ ...data, [path]: lesson }));
      });
    }
  }
}

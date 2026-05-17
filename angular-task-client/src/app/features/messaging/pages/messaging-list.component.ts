/**
 * Messaging Learning Page
 *
 * Hiển thị 4 bài Kafka/MQTT + nút demo Pub/Sub
 */
import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs';
import { environment } from '@env';
import { ApiResponse } from '@core/models/api-response.model';

interface Lesson {
  concept: string;
  explanation: string;
  codeExample: string;
  result: unknown;
  bestPractices: string[];
}

@Component({
  selector: 'app-messaging-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <h1>📡 Messaging Learning (Kafka & MQTT)</h1>
      <p class="subtitle">Concepts message-driven architecture</p>

      <div class="lessons">
        @for (item of lessons; track item.path) {
          <div class="lesson-card">
            <div class="lesson-header" (click)="toggleLesson(item.path)">
              <h3>{{ item.label }}</h3>
              <span>{{ expanded() === item.path ? '▼' : '▶' }}</span>
            </div>
            @if (expanded() === item.path) {
              @if (data()[item.path]; as lesson) {
                <div class="lesson-body">
                  <pre class="explanation">{{ lesson.explanation }}</pre>
                  <pre class="code">{{ lesson.codeExample }}</pre>
                  <h4>✅ Best Practices</h4>
                  <ul>
                    @for (bp of lesson.bestPractices; track bp) { <li>{{ bp }}</li> }
                  </ul>
                </div>
              } @else {
                <div class="loading">⏳ Đang tải...</div>
              }
            }
          </div>
        }
      </div>

      <div class="demo-section">
        <h2>🎮 Live Demo</h2>
        <button class="btn-primary" (click)="runPubSubDemo()">
          {{ demoRunning() ? '⏳ Running...' : '▶ Run Pub/Sub Demo' }}
        </button>
        @if (demoResult()) {
          <pre class="result">{{ demoResult() | json }}</pre>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 900px; margin: 0 auto; padding: 24px; }
    h1 { color: #e0e0e0; margin: 0 0 8px; }
    .subtitle { color: #888; margin-bottom: 24px; }
    .lessons { display: grid; gap: 12px; margin-bottom: 32px; }
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
    .explanation {
      color: #aaa; font-size: 13px; white-space: pre-wrap;
      background: rgba(0,0,0,0.2); padding: 12px; border-radius: 8px;
    }
    .code {
      background: rgba(0,0,0,0.3); color: #10b981; padding: 12px;
      border-radius: 8px; font-size: 12px; overflow-x: auto;
    }
    h4 { color: #a5b4fc; margin: 12px 0 8px; font-size: 14px; }
    ul { color: #aaa; padding-left: 20px; }
    li { margin-bottom: 4px; font-size: 13px; }
    .demo-section {
      background: rgba(255,255,255,0.05); border-radius: 12px; padding: 24px;
    }
    h2 { color: #e0e0e0; margin: 0 0 16px; }
    .btn-primary {
      padding: 12px 24px; border: none; border-radius: 8px;
      background: linear-gradient(135deg, #6c63ff, #3b82f6); color: #fff;
      font-size: 15px; cursor: pointer;
    }
    .result {
      margin-top: 16px; background: rgba(0,0,0,0.3); padding: 16px;
      border-radius: 8px; color: #a5b4fc; font-size: 13px;
    }
    .loading { text-align: center; padding: 20px; color: #888; }
  `],
})
export class MessagingListComponent {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/messaging`;

  lessons = [
    { path: 'kafka-vs-mqtt', label: '📊 Kafka vs MQTT' },
    { path: 'patterns', label: '🔄 @MessagePattern vs @EventPattern' },
    { path: 'dlq-idempotency', label: '☠️ Dead Letter Queue & Idempotency' },
  ];

  expanded = signal<string | null>(null);
  data = signal<Record<string, Lesson>>({});
  demoRunning = signal(false);
  demoResult = signal<unknown>(null);

  toggleLesson(path: string): void {
    if (this.expanded() === path) { this.expanded.set(null); return; }
    this.expanded.set(path);
    if (!this.data()[path]) {
      this.http.get<ApiResponse<Lesson>>(`${this.baseUrl}/${path}`)
        .pipe(map((r) => r.data), shareReplay(1))
        .subscribe((lesson) => this.data.update((d) => ({ ...d, [path]: lesson })));
    }
  }

  runPubSubDemo(): void {
    this.demoRunning.set(true);
    this.http.post<ApiResponse<unknown>>(`${this.baseUrl}/pub-sub-demo`, {})
      .pipe(map((r) => r.data))
      .subscribe({
        next: (result) => { this.demoResult.set(result); this.demoRunning.set(false); },
        error: () => this.demoRunning.set(false),
      });
  }
}

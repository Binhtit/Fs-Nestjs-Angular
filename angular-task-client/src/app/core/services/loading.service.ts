/**
 * KHÁI NIỆM: Loading Service (Signal-based)
 *
 * TẠI SAO dùng Signal thay BehaviorSubject:
 * - Signal là SYNC → đọc giá trị ngay, không cần subscribe
 * - Không cần unsubscribe → không memory leak
 * - Angular 2025 best practice: "Signals for state"
 *
 * CÁCH DÙNG:
 * Template: @if (loadingService.isLoading()) { <spinner /> }
 * Không cần async pipe!
 */
import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  /**
   * Đếm số request đang active
   * - Tăng 1 khi request bắt đầu
   * - Giảm 1 khi request kết thúc (success hoặc error)
   * → isLoading = true khi có >= 1 request đang chạy
   */
  private activeRequests = signal(0);

  /** Computed: tự update khi activeRequests thay đổi */
  isLoading = computed(() => this.activeRequests() > 0);

  show(): void {
    this.activeRequests.update((count) => count + 1);
  }

  hide(): void {
    this.activeRequests.update((count) => Math.max(0, count - 1));
  }
}

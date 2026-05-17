/**
 * Realtime Service - RxJS Subject làm event bus
 *
 * PATTERN: Subject làm cầu nối giữa business services và WebSocket gateway
 * - Services push events vào Subject
 * - Gateway subscribe Subject → broadcast đến clients
 * → Decoupled: Services không biết về WebSocket
 */
import { Injectable } from '@nestjs/common';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface RealtimeEvent {
  event: string;
  data: unknown;
  userId?: number;
}

@Injectable()
export class RealtimeService {
  /**
   * Subject: Event bus cho mọi real-time events
   * Dùng Subject (không phải BehaviorSubject) vì:
   * - Không cần giá trị khởi tạo
   * - Subscriber mới không cần nhận event cũ
   */
  private readonly eventSubject = new Subject<RealtimeEvent>();

  /**
   * BehaviorSubject: Track online users
   * Dùng BehaviorSubject vì:
   * - Cần giá trị khởi tạo (Set rỗng)
   * - Subscriber mới cần biết NGAY danh sách users online hiện tại
   */
  private readonly onlineUsers = new BehaviorSubject<Set<string>>(new Set());

  /** Push event vào stream */
  emit(event: string, data: unknown, userId?: number): void {
    this.eventSubject.next({ event, data, userId });
  }

  /** Subscribe toàn bộ events */
  getEventStream(): Observable<RealtimeEvent> {
    return this.eventSubject.asObservable();
  }

  /** Subscribe events theo tên */
  getEventsByName(eventName: string): Observable<RealtimeEvent> {
    return this.eventSubject.asObservable().pipe(
      filter((e) => e.event === eventName),
    );
  }

  /** Track user online/offline */
  addOnlineUser(clientId: string): void {
    const users = this.onlineUsers.getValue();
    users.add(clientId);
    this.onlineUsers.next(new Set(users));
  }

  removeOnlineUser(clientId: string): void {
    const users = this.onlineUsers.getValue();
    users.delete(clientId);
    this.onlineUsers.next(new Set(users));
  }

  getOnlineUsers(): Observable<Set<string>> {
    return this.onlineUsers.asObservable();
  }

  getOnlineCount(): number {
    return this.onlineUsers.getValue().size;
  }
}

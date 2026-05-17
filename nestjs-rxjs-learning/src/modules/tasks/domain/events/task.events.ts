/**
 * KHÁI NIỆM: Domain Events
 *
 * DOMAIN EVENT là gì:
 * - Sự kiện quan trọng đã xảy ra trong domain
 * - Past tense: TaskCreatedEvent (đã tạo), TaskCompletedEvent (đã hoàn thành)
 * - Immutable: Sự kiện đã xảy ra, không thể thay đổi
 *
 * TẠI SAO cần Domain Events:
 * 1. DECOUPLING: Tạo task xong → publish event → các handler tự xử lý
 *    (notification, cache, analytics) mà domain KHÔNG biết về chúng
 * 2. AUDIT TRAIL: Ghi lại mọi thay đổi quan trọng
 * 3. EVENTUAL CONSISTENCY: Trong microservices, events đảm bảo data sync
 *
 * VÍ DỤ THỰC TẾ:
 * TaskCreatedEvent published → 3 handlers chạy SONG SONG:
 *   1. NotificationHandler: Push notification qua WebSocket
 *   2. CacheHandler: Invalidate task list cache
 *   3. KafkaHandler: Publish lên Kafka topic cho service khác
 */
import { IEvent } from '@nestjs/cqrs';

/** Base class cho tất cả domain events */
export abstract class DomainEvent implements IEvent {
  readonly occurredAt: Date;

  constructor() {
    this.occurredAt = new Date();
  }
}

export class TaskCreatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: number,
    public readonly title: string,
    public readonly userId: number,
  ) {
    super();
  }
}

export class TaskUpdatedEvent extends DomainEvent {
  constructor(
    public readonly taskId: number,
    public readonly changes: Record<string, unknown>,
    public readonly userId: number,
  ) {
    super();
  }
}

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: number,
    public readonly userId: number,
    public readonly completedAt: Date,
  ) {
    super();
  }
}

export class TaskDeletedEvent extends DomainEvent {
  constructor(
    public readonly taskId: number,
    public readonly userId: number,
  ) {
    super();
  }
}

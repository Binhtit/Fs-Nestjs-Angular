/**
 * KHÁI NIỆM: Event Handlers — Side Effects
 *
 * Event Handlers xử lý các SIDE EFFECTS sau khi domain event xảy ra.
 * Chạy ASYNC, DECOUPLED khỏi command handler.
 *
 * 1 Event có thể có NHIỀU handlers → chạy SONG SONG
 * Handler fail KHÔNG ảnh hưởng command (eventual consistency)
 *
 * VÍ DỤ: TaskCreatedEvent → 3 handlers:
 * - LogHandler: Ghi audit log
 * - NotificationHandler: Push WebSocket notification
 * - CacheHandler: Invalidate cache
 * (Future: KafkaHandler: Publish lên Kafka topic)
 */
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import {
  TaskCreatedEvent,
  TaskUpdatedEvent,
  TaskCompletedEvent,
  TaskDeletedEvent,
} from '../../domain/events/task.events';

/**
 * TaskCreatedEvent → Log + (future: notify, cache invalidate)
 */
@EventsHandler(TaskCreatedEvent)
export class TaskCreatedHandler implements IEventHandler<TaskCreatedEvent> {
  private readonly logger = new Logger(TaskCreatedHandler.name);

  handle(event: TaskCreatedEvent): void {
    this.logger.log(
      `📝 [DomainEvent] Task #${event.taskId} "${event.title}" created by user #${event.userId}`,
    );
    // Future: this.realtimeService.emit('task:created', { ... })
    // Future: this.kafkaProducer.emit('task.created', event)
    // Future: this.cacheManager.del('tasks_list_*')
  }
}

@EventsHandler(TaskUpdatedEvent)
export class TaskUpdatedHandler implements IEventHandler<TaskUpdatedEvent> {
  private readonly logger = new Logger(TaskUpdatedHandler.name);

  handle(event: TaskUpdatedEvent): void {
    this.logger.log(
      `✏️ [DomainEvent] Task #${event.taskId} updated: ${JSON.stringify(event.changes)}`,
    );
  }
}

@EventsHandler(TaskCompletedEvent)
export class TaskCompletedHandler implements IEventHandler<TaskCompletedEvent> {
  private readonly logger = new Logger(TaskCompletedHandler.name);

  handle(event: TaskCompletedEvent): void {
    this.logger.log(
      `✅ [DomainEvent] Task #${event.taskId} COMPLETED by user #${event.userId} at ${event.completedAt.toISOString()}`,
    );
    // Future: Send congratulations email, update user stats, gamification
  }
}

@EventsHandler(TaskDeletedEvent)
export class TaskDeletedHandler implements IEventHandler<TaskDeletedEvent> {
  private readonly logger = new Logger(TaskDeletedHandler.name);

  handle(event: TaskDeletedEvent): void {
    this.logger.log(
      `🗑️ [DomainEvent] Task #${event.taskId} deleted by user #${event.userId}`,
    );
  }
}

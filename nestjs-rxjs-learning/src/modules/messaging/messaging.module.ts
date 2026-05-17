/**
 * KHÁI NIỆM: Messaging Module — Kafka + MQTT Learning
 *
 * MESSAGE-DRIVEN ARCHITECTURE:
 * Thay vì service A gọi HTTP trực tiếp service B:
 *   A → HTTP → B (coupling, B down = A fail)
 *
 * Dùng message broker:
 *   A → publish message → Broker → B consume (decoupled, async, resilient)
 *
 * SO SÁNH KAFKA vs MQTT:
 * ┌────────────┬───────────────────────┬───────────────────────┐
 * │            │ Apache Kafka          │ MQTT                  │
 * ├────────────┼───────────────────────┼───────────────────────┤
 * │ Mục đích   │ Event streaming       │ IoT messaging         │
 * │ Throughput │ Rất cao (millions/s)  │ Trung bình            │
 * │ Persistence│ Có (log retention)    │ Không (transient)     │
 * │ Consumer   │ Consumer Groups       │ QoS levels (0,1,2)    │
 * │ Ordering   │ Per partition         │ Per topic             │
 * │ Use case   │ Backend ↔ Backend     │ Device ↔ Server       │
 * └────────────┴───────────────────────┴───────────────────────┘
 *
 * TRONG DỰ ÁN NÀY:
 * Không có Docker → dùng NestJS TCP transport làm mock
 * Code structure GIỐNG HỆT khi dùng Kafka/MQTT thật
 * Chỉ cần đổi transport config để chuyển sang production
 */
import { Module } from '@nestjs/common';
import { MessagingExamplesController } from './messaging-examples.controller';
import { MessagingExamplesService } from './messaging-examples.service';
import { EventProducerService } from './event-producer.service';

@Module({
  controllers: [MessagingExamplesController],
  providers: [MessagingExamplesService, EventProducerService],
  exports: [EventProducerService],
})
export class MessagingModule {}

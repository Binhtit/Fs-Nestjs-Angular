/**
 * Messaging Examples Service — Learning Endpoints
 *
 * Giải thích chi tiết các concepts:
 * - Kafka vs MQTT use cases
 * - @MessagePattern vs @EventPattern
 * - Consumer Groups, Partitions, QoS
 * - Dead Letter Queue
 * - Idempotency
 */
import { Injectable } from '@nestjs/common';
import { EventProducerService } from './event-producer.service';
import { firstValueFrom, timeout } from 'rxjs';

export interface MessagingLesson {
  concept: string;
  explanation: string;
  codeExample: string;
  result: unknown;
  bestPractices: string[];
}

@Injectable()
export class MessagingExamplesService {
  constructor(private readonly producer: EventProducerService) {}

  /** Bài 1: Kafka vs MQTT */
  getKafkaVsMqtt(): MessagingLesson {
    return {
      concept: 'Kafka vs MQTT — Khi nào dùng cái nào',
      explanation: `
        KAFKA: Dùng cho Backend-to-Backend communication
        - Event streaming: Xử lý hàng triệu events/giây
        - Persistence: Messages lưu trên disk (replay được)
        - Consumer Groups: Nhiều consumers chia nhau xử lý
        - Use case: Order processing, log aggregation, analytics pipeline

        MQTT: Dùng cho IoT / Edge devices
        - Lightweight: Protocol nhẹ, ít bandwidth
        - QoS levels: 0 (at most once), 1 (at least once), 2 (exactly once)
        - Use case: Sensor data, smart home, mobile push notifications

        KẾT HỢP: IoT devices → MQTT → Backend → Kafka → Analytics
      `,
      codeExample: `
// Kafka Producer (NestJS)
@Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka;
this.kafkaClient.emit('order.created', { orderId: 123, total: 99.99 });

// Kafka Consumer
@EventPattern('order.created')
handleOrderCreated(@Payload() data: OrderCreatedEvent) {
  // Process order...
}

// MQTT Producer
@Inject('MQTT_SERVICE') private mqttClient: ClientMqtt;
this.mqttClient.emit('sensor/temperature', { value: 25.5, unit: 'C' });

// MQTT Consumer
@MessagePattern('sensor/temperature')
handleTemperature(@Payload() data: SensorData) {
  // Process sensor data...
}`,
      result: {
        kafka: { bestFor: 'Backend streaming', throughput: 'Millions/sec', persistence: true },
        mqtt: { bestFor: 'IoT devices', throughput: 'Thousands/sec', persistence: false },
      },
      bestPractices: [
        'Dùng Kafka cho inter-service communication trong microservices',
        'Dùng MQTT cho IoT devices, bridge data vào Kafka cho analytics',
        'Không dùng Kafka cho simple request-response (quá phức tạp)',
        'MQTT QoS 2 chậm — chỉ dùng khi exactly-once thực sự cần thiết',
      ],
    };
  }

  /** Bài 2: Message Patterns trong NestJS */
  getMessagePatterns(): MessagingLesson {
    return {
      concept: '@MessagePattern vs @EventPattern',
      explanation: `
        @MessagePattern (Request-Response):
        - Client GỬI message → ĐỨNG ĐỢI response
        - Giống HTTP request nhưng qua message broker
        - Use case: Query data từ service khác

        @EventPattern (Fire-and-Forget):
        - Client GỬI event → KHÔNG đợi response
        - Subscriber nhận và xử lý async
        - Use case: Notify other services about state changes

        NGUYÊN TẮC:
        - Ưu tiên @EventPattern (decoupled, scalable)
        - Chỉ dùng @MessagePattern khi CẦN response ngay
      `,
      codeExample: `
// === @MessagePattern: Request-Response ===
// Producer (Service A):
const user = await firstValueFrom(
  this.client.send('user.get', { userId: 123 })
);

// Consumer (Service B):
@MessagePattern('user.get')
getUser(@Payload() data: { userId: number }) {
  return this.userService.findById(data.userId); // Return response
}

// === @EventPattern: Fire-and-Forget ===
// Producer:
this.client.emit('order.shipped', { orderId: 456 });

// Consumer (multiple services can listen):
@EventPattern('order.shipped')
handleOrderShipped(@Payload() data: OrderShippedEvent) {
  // Send email, update tracking, notify warehouse...
  // No response needed
}`,
      result: {
        messagePattern: { type: 'Request-Response', blocking: true, useCase: 'Queries' },
        eventPattern: { type: 'Fire-and-Forget', blocking: false, useCase: 'Events/Notifications' },
      },
      bestPractices: [
        'Mặc định dùng @EventPattern cho inter-service communication',
        '@MessagePattern chỉ khi cần synchronous response',
        'Luôn handle timeout cho @MessagePattern (service có thể down)',
        'Event names dùng past tense: order.created, user.registered',
      ],
    };
  }

  /** Bài 3: Demo publish + consume */
  async demoPubSub(): Promise<MessagingLesson> {
    // 1. Setup subscriber TRƯỚC khi publish
    const receivedMessages: unknown[] = [];
    const subscription = this.producer
      .subscribe('demo.task.created')
      .pipe(timeout(2000))
      .subscribe({
        next: (msg) => receivedMessages.push(msg.payload),
      });

    // 2. Publish messages
    this.producer.publish('demo.task.created', { taskId: 1, title: 'Learn Kafka' });
    this.producer.publish('demo.task.created', { taskId: 2, title: 'Learn MQTT' });
    this.producer.publish('demo.other.topic', { ignored: true }); // Khác topic → không nhận

    // 3. Wait một chút rồi cleanup
    await new Promise((resolve) => setTimeout(resolve, 100));
    subscription.unsubscribe();

    return {
      concept: 'Pub/Sub Demo — Publish & Subscribe in action',
      explanation: `
        1. Tạo subscriber cho topic "demo.task.created"
        2. Publish 3 messages (2 đúng topic, 1 khác topic)
        3. Subscriber chỉ nhận 2 messages đúng topic
        4. Message khác topic bị bỏ qua (topic-based routing)
      `,
      codeExample: `
const sub = this.producer.subscribe('demo.task.created').subscribe(msg => {
  console.log('Received:', msg.payload);
});
this.producer.publish('demo.task.created', { taskId: 1 });
this.producer.publish('demo.other.topic', { ignored: true }); // Không nhận
      `,
      result: {
        published: 3,
        received: receivedMessages.length,
        receivedMessages,
        messageLog: this.producer.getMessageLog().slice(-3),
      },
      bestPractices: [
        'Subscribe TRƯỚC khi publish (tránh mất message)',
        'Dùng topic naming convention: domain.entity.action (task.created)',
        'Luôn unsubscribe khi không cần nữa (prevent memory leak)',
        'Idempotency: Handler phải handle duplicate messages gracefully',
      ],
    };
  }

  /** Bài 4: Dead Letter Queue + Idempotency */
  getDlqAndIdempotency(): MessagingLesson {
    return {
      concept: 'Dead Letter Queue (DLQ) & Idempotency',
      explanation: `
        DEAD LETTER QUEUE (DLQ):
        - Message xử lý THẤT BẠI → chuyển vào DLQ thay vì mất
        - DLQ là queue riêng chứa "poison pill" messages
        - Team review và re-process hoặc fix bug

        FLOW: Topic → Consumer → Fail 3 lần → DLQ → Manual review

        IDEMPOTENCY:
        - Trong distributed system, message có thể gửi NHIỀU LẦN
        - (network retry, consumer restart, at-least-once delivery)
        - Handler PHẢI cho kết quả GIỐNG NHAU dù gọi 1 hay 100 lần

        VÍ DỤ:
        - createOrder(orderId: 123) → lần 1: tạo order
        - createOrder(orderId: 123) → lần 2: return existing (KHÔNG tạo duplicate)
      `,
      codeExample: `
// === IDEMPOTENT HANDLER ===
@EventPattern('payment.processed')
async handlePayment(@Payload() data: PaymentEvent) {
  // 1. Check đã xử lý chưa (idempotency key)
  const existing = await this.repo.findByPaymentId(data.paymentId);
  if (existing) {
    this.logger.warn('Duplicate payment event, skipping');
    return; // KHÔNG xử lý lại
  }

  // 2. Xử lý lần đầu
  await this.repo.save({ paymentId: data.paymentId, ... });
}

// === DLQ PATTERN (Kafka) ===
// kafka config:
consumer: {
  groupId: 'order-service',
  retry: { retries: 3 },
}
// Sau 3 retries fail → message vào DLQ topic "order.created.dlq"`,
      result: {
        dlq: {
          purpose: 'Chứa messages xử lý thất bại',
          flow: 'Topic → Consumer → Fail N times → DLQ',
          action: 'Manual review, fix bug, re-process',
        },
        idempotency: {
          purpose: 'Xử lý duplicate messages an toàn',
          technique: 'Check idempotency key trước khi xử lý',
          examples: ['paymentId', 'orderId', 'messageId + deduplication window'],
        },
      },
      bestPractices: [
        'LUÔN implement idempotency cho event handlers',
        'Dùng unique ID (UUID) làm idempotency key',
        'DLQ monitoring: Alert khi có message vào DLQ',
        'Retry với exponential backoff (1s, 2s, 4s, ...)',
        'Log đầy đủ context khi gửi message vào DLQ',
      ],
    };
  }
}

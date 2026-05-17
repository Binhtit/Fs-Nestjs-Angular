/**
 * KHÁI NIỆM: Event Producer Service
 *
 * Producer: Phía GỬI message đến broker
 * Consumer: Phía NHẬN message từ broker
 *
 * TRONG NestJS Microservices:
 * - @MessagePattern('pattern'): Request-Response (đợi reply)
 * - @EventPattern('pattern'): Fire-and-forget (không đợi reply)
 *
 * Pattern phổ biến cho microservices:
 * 1. Dùng @EventPattern cho inter-service events (decoupled)
 * 2. Dùng @MessagePattern cho queries cần response (RPC-like)
 *
 * MOCK: Dùng in-memory Subject (RxJS) thay cho real broker
 * Production: Đổi sang ClientKafka hoặc ClientMqtt
 */
import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';

interface MessageEnvelope {
  topic: string;
  payload: unknown;
  timestamp: Date;
  headers?: Record<string, string>;
}

@Injectable()
export class EventProducerService {
  private readonly logger = new Logger(EventProducerService.name);

  /**
   * In-memory event bus (mock cho Kafka/MQTT)
   * Production: Thay bằng ClientProxy từ @nestjs/microservices
   *
   * Subject hoạt động như message broker đơn giản:
   * - publish() = produce message
   * - getStream() = subscribe = consume messages
   */
  private readonly eventStream = new Subject<MessageEnvelope>();
  private readonly messageLog: MessageEnvelope[] = [];

  /**
   * Publish event (giống Kafka producer.send())
   *
   * KAFKA PRODUCTION CODE:
   * ```
   * @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka;
   * this.kafkaClient.emit('task.created', payload);
   * ```
   */
  publish(topic: string, payload: unknown): void {
    const envelope: MessageEnvelope = {
      topic,
      payload,
      timestamp: new Date(),
    };

    this.messageLog.push(envelope);
    this.eventStream.next(envelope);

    this.logger.log(
      `📤 [Produce] Topic: "${topic}" | Payload: ${JSON.stringify(payload)}`,
    );
  }

  /** Subscribe to topic (giống Kafka consumer.subscribe()) */
  subscribe(topic: string): Observable<MessageEnvelope> {
    return new Observable((subscriber) => {
      const sub = this.eventStream.subscribe((msg) => {
        if (msg.topic === topic) {
          subscriber.next(msg);
        }
      });
      return () => sub.unsubscribe();
    });
  }

  /** Lấy message log (for learning/debug) */
  getMessageLog(): MessageEnvelope[] {
    return [...this.messageLog];
  }

  /** Clear log */
  clearLog(): void {
    this.messageLog.length = 0;
  }
}

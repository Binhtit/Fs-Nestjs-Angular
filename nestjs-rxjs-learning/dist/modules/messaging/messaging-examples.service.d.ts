import { EventProducerService } from './event-producer.service';
export interface MessagingLesson {
    concept: string;
    explanation: string;
    codeExample: string;
    result: unknown;
    bestPractices: string[];
}
export declare class MessagingExamplesService {
    private readonly producer;
    constructor(producer: EventProducerService);
    getKafkaVsMqtt(): MessagingLesson;
    getMessagePatterns(): MessagingLesson;
    demoPubSub(): Promise<MessagingLesson>;
    getDlqAndIdempotency(): MessagingLesson;
}

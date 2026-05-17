import { Observable } from 'rxjs';
interface MessageEnvelope {
    topic: string;
    payload: unknown;
    timestamp: Date;
    headers?: Record<string, string>;
}
export declare class EventProducerService {
    private readonly logger;
    private readonly eventStream;
    private readonly messageLog;
    publish(topic: string, payload: unknown): void;
    subscribe(topic: string): Observable<MessageEnvelope>;
    getMessageLog(): MessageEnvelope[];
    clearLog(): void;
}
export {};

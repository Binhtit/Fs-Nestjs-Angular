import { Observable } from 'rxjs';
export interface RealtimeEvent {
    event: string;
    data: unknown;
    userId?: number;
}
export declare class RealtimeService {
    private readonly eventSubject;
    private readonly onlineUsers;
    emit(event: string, data: unknown, userId?: number): void;
    getEventStream(): Observable<RealtimeEvent>;
    getEventsByName(eventName: string): Observable<RealtimeEvent>;
    addOnlineUser(clientId: string): void;
    removeOnlineUser(clientId: string): void;
    getOnlineUsers(): Observable<Set<string>>;
    getOnlineCount(): number;
}

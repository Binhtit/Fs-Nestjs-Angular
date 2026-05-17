/**
 * WebSocket Gateway - Real-time communication
 *
 * KHÁI NIỆM: Gateway là NestJS wrapper cho WebSocket server
 * - @WebSocketGateway(): Decorator tạo WebSocket endpoint
 * - @SubscribeMessage(): Handler cho client messages
 * - Lifecycle: OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
 */
import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/realtime',
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly realtimeService: RealtimeService) {}

  /** Sau khi WebSocket server init → subscribe event stream */
  afterInit(): void {
    this.logger.log('WebSocket Gateway initialized');

    // Subscribe event bus → broadcast đến clients
    this.realtimeService.getEventStream().subscribe(({ event, data }) => {
      this.server.emit(event, data);
    });
  }

  /** Client kết nối */
  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    this.realtimeService.addOnlineUser(client.id);
    this.server.emit('users:online', {
      count: this.realtimeService.getOnlineCount(),
    });
  }

  /** Client ngắt kết nối */
  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.realtimeService.removeOnlineUser(client.id);
    this.server.emit('users:online', {
      count: this.realtimeService.getOnlineCount(),
    });
  }

  /** Handle message từ client */
  @SubscribeMessage('ping')
  handlePing(client: Socket): { event: string; data: string } {
    return { event: 'pong', data: `Pong from server at ${new Date().toISOString()}` };
  }
}

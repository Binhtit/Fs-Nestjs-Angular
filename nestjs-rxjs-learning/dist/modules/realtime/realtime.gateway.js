"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RealtimeGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeGateway = void 0;
const common_1 = require("@nestjs/common");
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const realtime_service_1 = require("./realtime.service");
let RealtimeGateway = RealtimeGateway_1 = class RealtimeGateway {
    realtimeService;
    server;
    logger = new common_1.Logger(RealtimeGateway_1.name);
    constructor(realtimeService) {
        this.realtimeService = realtimeService;
    }
    afterInit() {
        this.logger.log('WebSocket Gateway initialized');
        this.realtimeService.getEventStream().subscribe(({ event, data }) => {
            this.server.emit(event, data);
        });
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
        this.realtimeService.addOnlineUser(client.id);
        this.server.emit('users:online', {
            count: this.realtimeService.getOnlineCount(),
        });
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
        this.realtimeService.removeOnlineUser(client.id);
        this.server.emit('users:online', {
            count: this.realtimeService.getOnlineCount(),
        });
    }
    handlePing(client) {
        return { event: 'pong', data: `Pong from server at ${new Date().toISOString()}` };
    }
};
exports.RealtimeGateway = RealtimeGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], RealtimeGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('ping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Object)
], RealtimeGateway.prototype, "handlePing", null);
exports.RealtimeGateway = RealtimeGateway = RealtimeGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/realtime',
    }),
    __metadata("design:paramtypes", [realtime_service_1.RealtimeService])
], RealtimeGateway);
//# sourceMappingURL=realtime.gateway.js.map
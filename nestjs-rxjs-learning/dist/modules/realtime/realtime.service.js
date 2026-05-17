"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimeService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
let RealtimeService = class RealtimeService {
    eventSubject = new rxjs_1.Subject();
    onlineUsers = new rxjs_1.BehaviorSubject(new Set());
    emit(event, data, userId) {
        this.eventSubject.next({ event, data, userId });
    }
    getEventStream() {
        return this.eventSubject.asObservable();
    }
    getEventsByName(eventName) {
        return this.eventSubject.asObservable().pipe((0, operators_1.filter)((e) => e.event === eventName));
    }
    addOnlineUser(clientId) {
        const users = this.onlineUsers.getValue();
        users.add(clientId);
        this.onlineUsers.next(new Set(users));
    }
    removeOnlineUser(clientId) {
        const users = this.onlineUsers.getValue();
        users.delete(clientId);
        this.onlineUsers.next(new Set(users));
    }
    getOnlineUsers() {
        return this.onlineUsers.asObservable();
    }
    getOnlineCount() {
        return this.onlineUsers.getValue().size;
    }
};
exports.RealtimeService = RealtimeService;
exports.RealtimeService = RealtimeService = __decorate([
    (0, common_1.Injectable)()
], RealtimeService);
//# sourceMappingURL=realtime.service.js.map
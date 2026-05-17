"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var EventProducerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventProducerService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let EventProducerService = EventProducerService_1 = class EventProducerService {
    logger = new common_1.Logger(EventProducerService_1.name);
    eventStream = new rxjs_1.Subject();
    messageLog = [];
    publish(topic, payload) {
        const envelope = {
            topic,
            payload,
            timestamp: new Date(),
        };
        this.messageLog.push(envelope);
        this.eventStream.next(envelope);
        this.logger.log(`📤 [Produce] Topic: "${topic}" | Payload: ${JSON.stringify(payload)}`);
    }
    subscribe(topic) {
        return new rxjs_1.Observable((subscriber) => {
            const sub = this.eventStream.subscribe((msg) => {
                if (msg.topic === topic) {
                    subscriber.next(msg);
                }
            });
            return () => sub.unsubscribe();
        });
    }
    getMessageLog() {
        return [...this.messageLog];
    }
    clearLog() {
        this.messageLog.length = 0;
    }
};
exports.EventProducerService = EventProducerService;
exports.EventProducerService = EventProducerService = EventProducerService_1 = __decorate([
    (0, common_1.Injectable)()
], EventProducerService);
//# sourceMappingURL=event-producer.service.js.map
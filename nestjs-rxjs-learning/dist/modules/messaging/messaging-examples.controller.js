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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingExamplesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const messaging_examples_service_1 = require("./messaging-examples.service");
let MessagingExamplesController = class MessagingExamplesController {
    service;
    constructor(service) {
        this.service = service;
    }
    kafkaVsMqtt() {
        return this.service.getKafkaVsMqtt();
    }
    messagePatterns() {
        return this.service.getMessagePatterns();
    }
    pubSubDemo() {
        return this.service.demoPubSub();
    }
    dlqIdempotency() {
        return this.service.getDlqAndIdempotency();
    }
};
exports.MessagingExamplesController = MessagingExamplesController;
__decorate([
    (0, common_1.Get)('kafka-vs-mqtt'),
    (0, swagger_1.ApiOperation)({ summary: 'Bài 1: So sánh Kafka vs MQTT' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessagingExamplesController.prototype, "kafkaVsMqtt", null);
__decorate([
    (0, common_1.Get)('patterns'),
    (0, swagger_1.ApiOperation)({ summary: 'Bài 2: @MessagePattern vs @EventPattern' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessagingExamplesController.prototype, "messagePatterns", null);
__decorate([
    (0, common_1.Post)('pub-sub-demo'),
    (0, swagger_1.ApiOperation)({ summary: 'Bài 3: Demo Publish/Subscribe' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessagingExamplesController.prototype, "pubSubDemo", null);
__decorate([
    (0, common_1.Get)('dlq-idempotency'),
    (0, swagger_1.ApiOperation)({ summary: 'Bài 4: Dead Letter Queue & Idempotency' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MessagingExamplesController.prototype, "dlqIdempotency", null);
exports.MessagingExamplesController = MessagingExamplesController = __decorate([
    (0, swagger_1.ApiTags)('Messaging (Kafka & MQTT Learning)'),
    (0, common_1.Controller)('messaging'),
    (0, public_decorator_1.Public)(),
    __metadata("design:paramtypes", [messaging_examples_service_1.MessagingExamplesService])
], MessagingExamplesController);
//# sourceMappingURL=messaging-examples.controller.js.map
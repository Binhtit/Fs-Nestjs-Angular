"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TaskCreatedHandler_1, TaskUpdatedHandler_1, TaskCompletedHandler_1, TaskDeletedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDeletedHandler = exports.TaskCompletedHandler = exports.TaskUpdatedHandler = exports.TaskCreatedHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const task_events_1 = require("../../domain/events/task.events");
let TaskCreatedHandler = TaskCreatedHandler_1 = class TaskCreatedHandler {
    logger = new common_1.Logger(TaskCreatedHandler_1.name);
    handle(event) {
        this.logger.log(`📝 [DomainEvent] Task #${event.taskId} "${event.title}" created by user #${event.userId}`);
    }
};
exports.TaskCreatedHandler = TaskCreatedHandler;
exports.TaskCreatedHandler = TaskCreatedHandler = TaskCreatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(task_events_1.TaskCreatedEvent)
], TaskCreatedHandler);
let TaskUpdatedHandler = TaskUpdatedHandler_1 = class TaskUpdatedHandler {
    logger = new common_1.Logger(TaskUpdatedHandler_1.name);
    handle(event) {
        this.logger.log(`✏️ [DomainEvent] Task #${event.taskId} updated: ${JSON.stringify(event.changes)}`);
    }
};
exports.TaskUpdatedHandler = TaskUpdatedHandler;
exports.TaskUpdatedHandler = TaskUpdatedHandler = TaskUpdatedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(task_events_1.TaskUpdatedEvent)
], TaskUpdatedHandler);
let TaskCompletedHandler = TaskCompletedHandler_1 = class TaskCompletedHandler {
    logger = new common_1.Logger(TaskCompletedHandler_1.name);
    handle(event) {
        this.logger.log(`✅ [DomainEvent] Task #${event.taskId} COMPLETED by user #${event.userId} at ${event.completedAt.toISOString()}`);
    }
};
exports.TaskCompletedHandler = TaskCompletedHandler;
exports.TaskCompletedHandler = TaskCompletedHandler = TaskCompletedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(task_events_1.TaskCompletedEvent)
], TaskCompletedHandler);
let TaskDeletedHandler = TaskDeletedHandler_1 = class TaskDeletedHandler {
    logger = new common_1.Logger(TaskDeletedHandler_1.name);
    handle(event) {
        this.logger.log(`🗑️ [DomainEvent] Task #${event.taskId} deleted by user #${event.userId}`);
    }
};
exports.TaskDeletedHandler = TaskDeletedHandler;
exports.TaskDeletedHandler = TaskDeletedHandler = TaskDeletedHandler_1 = __decorate([
    (0, cqrs_1.EventsHandler)(task_events_1.TaskDeletedEvent)
], TaskDeletedHandler);
//# sourceMappingURL=task-event.handlers.js.map
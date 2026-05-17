"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskDeletedEvent = exports.TaskCompletedEvent = exports.TaskUpdatedEvent = exports.TaskCreatedEvent = exports.DomainEvent = void 0;
class DomainEvent {
    occurredAt;
    constructor() {
        this.occurredAt = new Date();
    }
}
exports.DomainEvent = DomainEvent;
class TaskCreatedEvent extends DomainEvent {
    taskId;
    title;
    userId;
    constructor(taskId, title, userId) {
        super();
        this.taskId = taskId;
        this.title = title;
        this.userId = userId;
    }
}
exports.TaskCreatedEvent = TaskCreatedEvent;
class TaskUpdatedEvent extends DomainEvent {
    taskId;
    changes;
    userId;
    constructor(taskId, changes, userId) {
        super();
        this.taskId = taskId;
        this.changes = changes;
        this.userId = userId;
    }
}
exports.TaskUpdatedEvent = TaskUpdatedEvent;
class TaskCompletedEvent extends DomainEvent {
    taskId;
    userId;
    completedAt;
    constructor(taskId, userId, completedAt) {
        super();
        this.taskId = taskId;
        this.userId = userId;
        this.completedAt = completedAt;
    }
}
exports.TaskCompletedEvent = TaskCompletedEvent;
class TaskDeletedEvent extends DomainEvent {
    taskId;
    userId;
    constructor(taskId, userId) {
        super();
        this.taskId = taskId;
        this.userId = userId;
    }
}
exports.TaskDeletedEvent = TaskDeletedEvent;
//# sourceMappingURL=task.events.js.map
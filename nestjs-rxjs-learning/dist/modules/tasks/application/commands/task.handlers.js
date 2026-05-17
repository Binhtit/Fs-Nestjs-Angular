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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTaskHandler = exports.UpdateTaskHandler = exports.CreateTaskHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const task_entity_1 = require("../../domain/entities/task.entity");
const task_repository_1 = require("../../domain/repositories/task.repository");
const task_events_1 = require("../../domain/events/task.events");
const business_exception_1 = require("../../../../common/exceptions/business.exception");
const error_code_constant_1 = require("../../../../common/constants/error-code.constant");
const task_commands_1 = require("./task.commands");
let CreateTaskHandler = class CreateTaskHandler {
    taskRepo;
    eventBus;
    constructor(taskRepo, eventBus) {
        this.taskRepo = taskRepo;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const task = task_entity_1.Task.create(command.title, command.userId, command.description, command.dueDate ? new Date(command.dueDate) : null);
        const saved = await this.taskRepo.save(task);
        this.eventBus.publish(new task_events_1.TaskCreatedEvent(saved.id, saved.title.getValue(), saved.userId));
        return saved;
    }
};
exports.CreateTaskHandler = CreateTaskHandler;
exports.CreateTaskHandler = CreateTaskHandler = __decorate([
    (0, cqrs_1.CommandHandler)(task_commands_1.CreateTaskCommand),
    __param(0, (0, common_1.Inject)(task_repository_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], CreateTaskHandler);
let UpdateTaskHandler = class UpdateTaskHandler {
    taskRepo;
    eventBus;
    constructor(taskRepo, eventBus) {
        this.taskRepo = taskRepo;
        this.eventBus = eventBus;
    }
    async execute(command) {
        const task = await this.taskRepo.findById(command.taskId, command.userId);
        if (!task) {
            throw business_exception_1.BusinessException.notFound(error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.code, error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.message);
        }
        const changes = {};
        if (command.title) {
            task.changeTitle(command.title);
            changes.title = command.title;
        }
        if (command.description !== undefined) {
            task.updateDescription(command.description ?? null);
            changes.description = command.description;
        }
        const wasCompleted = task.status.isCompleted();
        if (command.status) {
            task.changeStatus(command.status);
            changes.status = command.status;
        }
        const saved = await this.taskRepo.save(task);
        if (!wasCompleted && saved.status.isCompleted()) {
            this.eventBus.publish(new task_events_1.TaskCompletedEvent(saved.id, saved.userId, new Date()));
        }
        else {
            this.eventBus.publish(new task_events_1.TaskUpdatedEvent(saved.id, changes, saved.userId));
        }
        return saved;
    }
};
exports.UpdateTaskHandler = UpdateTaskHandler;
exports.UpdateTaskHandler = UpdateTaskHandler = __decorate([
    (0, cqrs_1.CommandHandler)(task_commands_1.UpdateTaskCommand),
    __param(0, (0, common_1.Inject)(task_repository_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], UpdateTaskHandler);
let DeleteTaskHandler = class DeleteTaskHandler {
    taskRepo;
    eventBus;
    constructor(taskRepo, eventBus) {
        this.taskRepo = taskRepo;
        this.eventBus = eventBus;
    }
    async execute(command) {
        await this.taskRepo.softDelete(command.taskId, command.userId);
        this.eventBus.publish(new task_events_1.TaskDeletedEvent(command.taskId, command.userId));
    }
};
exports.DeleteTaskHandler = DeleteTaskHandler;
exports.DeleteTaskHandler = DeleteTaskHandler = __decorate([
    (0, cqrs_1.CommandHandler)(task_commands_1.DeleteTaskCommand),
    __param(0, (0, common_1.Inject)(task_repository_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object, cqrs_1.EventBus])
], DeleteTaskHandler);
//# sourceMappingURL=task.handlers.js.map
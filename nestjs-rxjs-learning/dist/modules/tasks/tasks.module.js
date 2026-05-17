"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksModule = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const typeorm_1 = require("@nestjs/typeorm");
const task_orm_entity_1 = require("./infrastructure/persistence/task.orm-entity");
const task_typeorm_repository_1 = require("./infrastructure/persistence/task.typeorm-repository");
const tasks_ddd_controller_1 = require("./infrastructure/controllers/tasks-ddd.controller");
const task_repository_1 = require("./domain/repositories/task.repository");
const task_handlers_1 = require("./application/commands/task.handlers");
const task_queries_1 = require("./application/queries/task.queries");
const task_event_handlers_1 = require("./application/events/task-event.handlers");
const tasks_service_1 = require("./tasks.service");
const tasks_controller_1 = require("./tasks.controller");
const task_entity_1 = require("./entities/task.entity");
const CommandHandlers = [task_handlers_1.CreateTaskHandler, task_handlers_1.UpdateTaskHandler, task_handlers_1.DeleteTaskHandler];
const QueryHandlers = [task_queries_1.GetTasksHandler, task_queries_1.GetTaskByIdHandler];
const EventHandlers = [
    task_event_handlers_1.TaskCreatedHandler,
    task_event_handlers_1.TaskUpdatedHandler,
    task_event_handlers_1.TaskCompletedHandler,
    task_event_handlers_1.TaskDeletedHandler,
];
let TasksModule = class TasksModule {
};
exports.TasksModule = TasksModule;
exports.TasksModule = TasksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            cqrs_1.CqrsModule,
            typeorm_1.TypeOrmModule.forFeature([task_orm_entity_1.TaskOrmEntity, task_entity_1.TaskEntity]),
        ],
        controllers: [
            tasks_ddd_controller_1.TasksDddController,
            tasks_controller_1.TasksController,
        ],
        providers: [
            {
                provide: task_repository_1.TASK_REPOSITORY,
                useClass: task_typeorm_repository_1.TaskTypeOrmRepository,
            },
            ...CommandHandlers,
            ...QueryHandlers,
            ...EventHandlers,
            tasks_service_1.TasksService,
        ],
    })
], TasksModule);
//# sourceMappingURL=tasks.module.js.map
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
exports.TasksDddController = void 0;
const common_1 = require("@nestjs/common");
const cqrs_1 = require("@nestjs/cqrs");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const task_commands_1 = require("../../application/commands/task.commands");
const task_queries_1 = require("../../application/queries/task.queries");
const create_task_dto_1 = require("../../dto/create-task.dto");
const update_task_dto_1 = require("../../dto/update-task.dto");
const query_task_dto_1 = require("../../dto/query-task.dto");
let TasksDddController = class TasksDddController {
    commandBus;
    queryBus;
    constructor(commandBus, queryBus) {
        this.commandBus = commandBus;
        this.queryBus = queryBus;
    }
    async create(dto, userId) {
        const command = new task_commands_1.CreateTaskCommand(dto.title, userId, dto.description, dto.dueDate);
        const task = await this.commandBus.execute(command);
        return this.toResponse(task);
    }
    async findAll(query, userId) {
        const q = new task_queries_1.GetTasksQuery(userId, query.page, query.limit, query.sortBy, query.sortOrder, query.status, query.search);
        const result = await this.queryBus.execute(q);
        return {
            tasks: result.tasks.map(this.toResponse),
            total: result.total,
            page: query.page ?? 1,
            limit: query.limit ?? 10,
        };
    }
    async findOne(id, userId) {
        const task = await this.queryBus.execute(new task_queries_1.GetTaskByIdQuery(id, userId));
        return this.toResponse(task);
    }
    async update(id, dto, userId) {
        const command = new task_commands_1.UpdateTaskCommand(id, userId, dto.title, dto.description, dto.status);
        const task = await this.commandBus.execute(command);
        return this.toResponse(task);
    }
    async remove(id, userId) {
        await this.commandBus.execute(new task_commands_1.DeleteTaskCommand(id, userId));
        return { deleted: true };
    }
    toResponse(task) {
        return {
            id: task.id,
            title: task.title.getValue(),
            description: task.description,
            status: task.status.getValue(),
            dueDate: task.dueDate,
            userId: task.userId,
            isOverdue: task.isOverdue(),
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
        };
    }
};
exports.TasksDddController = TasksDddController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Tạo task mới (qua CommandBus)' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto, Number]),
    __metadata("design:returntype", Promise)
], TasksDddController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy danh sách tasks (qua QueryBus)' }),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_task_dto_1.QueryTaskDto, Number]),
    __metadata("design:returntype", Promise)
], TasksDddController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Lấy task theo ID' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TasksDddController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Cập nhật task (qua CommandBus)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_task_dto_1.UpdateTaskDto, Number]),
    __metadata("design:returntype", Promise)
], TasksDddController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Xóa task (soft delete)' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], TasksDddController.prototype, "remove", null);
exports.TasksDddController = TasksDddController = __decorate([
    (0, swagger_1.ApiTags)('Tasks-DDD (CQRS)'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('tasks-ddd'),
    __metadata("design:paramtypes", [cqrs_1.CommandBus,
        cqrs_1.QueryBus])
], TasksDddController);
//# sourceMappingURL=tasks-ddd.controller.js.map
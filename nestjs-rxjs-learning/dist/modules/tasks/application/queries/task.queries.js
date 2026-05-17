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
exports.GetTaskByIdHandler = exports.GetTasksHandler = exports.GetTaskByIdQuery = exports.GetTasksQuery = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const task_repository_1 = require("../../domain/repositories/task.repository");
const business_exception_1 = require("../../../../common/exceptions/business.exception");
const error_code_constant_1 = require("../../../../common/constants/error-code.constant");
class GetTasksQuery {
    userId;
    page;
    limit;
    sortBy;
    sortOrder;
    status;
    search;
    constructor(userId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', status, search) {
        this.userId = userId;
        this.page = page;
        this.limit = limit;
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        this.status = status;
        this.search = search;
    }
}
exports.GetTasksQuery = GetTasksQuery;
class GetTaskByIdQuery {
    taskId;
    userId;
    constructor(taskId, userId) {
        this.taskId = taskId;
        this.userId = userId;
    }
}
exports.GetTaskByIdQuery = GetTaskByIdQuery;
let GetTasksHandler = class GetTasksHandler {
    taskRepo;
    constructor(taskRepo) {
        this.taskRepo = taskRepo;
    }
    async execute(query) {
        return this.taskRepo.findAll({
            userId: query.userId,
            page: query.page,
            limit: query.limit,
            sortBy: query.sortBy,
            sortOrder: query.sortOrder,
            status: query.status,
            search: query.search,
        });
    }
};
exports.GetTasksHandler = GetTasksHandler;
exports.GetTasksHandler = GetTasksHandler = __decorate([
    (0, cqrs_1.QueryHandler)(GetTasksQuery),
    __param(0, (0, common_1.Inject)(task_repository_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetTasksHandler);
let GetTaskByIdHandler = class GetTaskByIdHandler {
    taskRepo;
    constructor(taskRepo) {
        this.taskRepo = taskRepo;
    }
    async execute(query) {
        const task = await this.taskRepo.findById(query.taskId, query.userId);
        if (!task) {
            throw business_exception_1.BusinessException.notFound(error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.code, error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.message);
        }
        return task;
    }
};
exports.GetTaskByIdHandler = GetTaskByIdHandler;
exports.GetTaskByIdHandler = GetTaskByIdHandler = __decorate([
    (0, cqrs_1.QueryHandler)(GetTaskByIdQuery),
    __param(0, (0, common_1.Inject)(task_repository_1.TASK_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], GetTaskByIdHandler);
//# sourceMappingURL=task.queries.js.map
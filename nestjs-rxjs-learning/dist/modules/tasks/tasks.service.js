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
var TasksService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const typeorm_2 = require("typeorm");
const api_response_dto_1 = require("../../common/dto/api-response.dto");
const business_exception_1 = require("../../common/exceptions/business.exception");
const error_code_constant_1 = require("../../common/constants/error-code.constant");
const task_entity_1 = require("./entities/task.entity");
let TasksService = TasksService_1 = class TasksService {
    taskRepository;
    logger = new common_1.Logger(TasksService_1.name);
    constructor(taskRepository) {
        this.taskRepository = taskRepository;
    }
    create(dto, userId) {
        const task = this.taskRepository.create({
            ...dto,
            userId,
        });
        return (0, rxjs_1.from)(this.taskRepository.save(task)).pipe((0, operators_1.map)((savedTask) => {
            this.logger.log(`Task created: ${savedTask.id} by user ${userId}`);
            return savedTask;
        }), (0, operators_1.catchError)((error) => {
            this.logger.error(`Failed to create task: ${error.message}`);
            return (0, rxjs_1.throwError)(() => new business_exception_1.BusinessException(error_code_constant_1.ERROR_CODES.SYSTEM_INTERNAL_ERROR.code, 'Không thể tạo task, vui lòng thử lại'));
        }));
    }
    findAll(query, userId) {
        const { page, limit, sortBy, sortOrder, status, search } = query;
        const qb = this.taskRepository
            .createQueryBuilder('task')
            .where('task.userId = :userId', { userId });
        if (status) {
            qb.andWhere('task.status = :status', { status });
        }
        if (search) {
            qb.andWhere('task.title LIKE :search', { search: `%${search}%` });
        }
        const allowedSortFields = ['createdAt', 'title', 'status', 'dueDate'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
        qb.orderBy(`task.${safeSortBy}`, sortOrder);
        qb.skip((page - 1) * limit).take(limit);
        return (0, rxjs_1.from)(qb.getManyAndCount()).pipe((0, operators_1.map)(([tasks, total]) => {
            const pagination = {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            };
            return api_response_dto_1.ApiResponse.paginated(tasks, pagination);
        }));
    }
    findOne(id, userId) {
        return (0, rxjs_1.from)(this.taskRepository.findOne({ where: { id, userId } })).pipe((0, operators_1.map)((task) => {
            if (!task) {
                throw business_exception_1.BusinessException.notFound(error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.code, error_code_constant_1.ERROR_CODES.TASK_NOT_FOUND.message);
            }
            return task;
        }));
    }
    update(id, dto, userId) {
        return this.findOne(id, userId).pipe((0, operators_1.switchMap)((task) => {
            Object.assign(task, dto);
            return (0, rxjs_1.from)(this.taskRepository.save(task));
        }));
    }
    remove(id, userId) {
        return this.findOne(id, userId).pipe((0, operators_1.switchMap)((task) => (0, rxjs_1.from)(this.taskRepository.softRemove(task))), (0, operators_1.map)(() => undefined));
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = TasksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.TaskEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map
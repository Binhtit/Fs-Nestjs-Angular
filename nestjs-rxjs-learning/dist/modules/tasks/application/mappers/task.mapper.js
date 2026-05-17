"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskMapper = void 0;
const task_entity_1 = require("../../domain/entities/task.entity");
const task_title_vo_1 = require("../../domain/value-objects/task-title.vo");
const task_status_vo_1 = require("../../domain/value-objects/task-status.vo");
class TaskMapper {
    static toDomain(orm) {
        return task_entity_1.Task.reconstitute({
            id: orm.id,
            title: task_title_vo_1.TaskTitle.create(orm.title),
            description: orm.description,
            status: task_status_vo_1.TaskStatus.create(orm.status),
            dueDate: orm.dueDate,
            userId: orm.userId,
            createdAt: orm.createdAt,
            updatedAt: orm.updatedAt,
        });
    }
    static toPersistence(domain) {
        return {
            id: domain.id,
            title: domain.title.getValue(),
            description: domain.description,
            status: domain.status.getValue(),
            dueDate: domain.dueDate,
            userId: domain.userId,
        };
    }
}
exports.TaskMapper = TaskMapper;
//# sourceMappingURL=task.mapper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteTaskCommand = exports.UpdateTaskCommand = exports.CreateTaskCommand = void 0;
class CreateTaskCommand {
    title;
    userId;
    description;
    dueDate;
    constructor(title, userId, description, dueDate) {
        this.title = title;
        this.userId = userId;
        this.description = description;
        this.dueDate = dueDate;
    }
}
exports.CreateTaskCommand = CreateTaskCommand;
class UpdateTaskCommand {
    taskId;
    userId;
    title;
    description;
    status;
    constructor(taskId, userId, title, description, status) {
        this.taskId = taskId;
        this.userId = userId;
        this.title = title;
        this.description = description;
        this.status = status;
    }
}
exports.UpdateTaskCommand = UpdateTaskCommand;
class DeleteTaskCommand {
    taskId;
    userId;
    constructor(taskId, userId) {
        this.taskId = taskId;
        this.userId = userId;
    }
}
exports.DeleteTaskCommand = DeleteTaskCommand;
//# sourceMappingURL=task.commands.js.map
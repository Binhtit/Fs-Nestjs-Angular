"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const task_title_vo_1 = require("../value-objects/task-title.vo");
const task_status_vo_1 = require("../value-objects/task-status.vo");
class Task {
    _id;
    _title;
    _description;
    _status;
    _dueDate;
    _userId;
    _createdAt;
    _updatedAt;
    constructor(props) {
        this._id = props.id;
        this._title = props.title;
        this._description = props.description;
        this._status = props.status;
        this._dueDate = props.dueDate;
        this._userId = props.userId;
        this._createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }
    static create(title, userId, description, dueDate) {
        return new Task({
            title: task_title_vo_1.TaskTitle.create(title),
            description: description ?? null,
            status: task_status_vo_1.TaskStatus.todo(),
            dueDate: dueDate ?? null,
            userId,
        });
    }
    static reconstitute(props) {
        return new Task(props);
    }
    get id() { return this._id; }
    get title() { return this._title; }
    get description() { return this._description; }
    get status() { return this._status; }
    get dueDate() { return this._dueDate; }
    get userId() { return this._userId; }
    get createdAt() { return this._createdAt; }
    get updatedAt() { return this._updatedAt; }
    changeTitle(newTitle) {
        this._title = task_title_vo_1.TaskTitle.create(newTitle);
        this._updatedAt = new Date();
    }
    updateDescription(description) {
        this._description = description;
        this._updatedAt = new Date();
    }
    changeStatus(newStatus) {
        this._status = this._status.transitionTo(newStatus);
        this._updatedAt = new Date();
    }
    complete() {
        this._status = this._status.transitionTo('DONE');
        this._updatedAt = new Date();
    }
    isOverdue() {
        if (!this._dueDate)
            return false;
        return new Date() > this._dueDate && !this._status.isFinal();
    }
    assignId(id) {
        if (this._id !== undefined) {
            throw new Error('Task đã có ID, không thể assign lại');
        }
        this._id = id;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.entity.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskTitle = void 0;
class TaskTitle {
    value;
    constructor(value) {
        this.value = value;
        Object.freeze(this);
    }
    static create(title) {
        if (!title || title.trim().length === 0) {
            throw new Error('Task title không được để trống');
        }
        if (title.trim().length > 200) {
            throw new Error('Task title không được quá 200 ký tự');
        }
        return new TaskTitle(title.trim());
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
exports.TaskTitle = TaskTitle;
//# sourceMappingURL=task-title.vo.js.map
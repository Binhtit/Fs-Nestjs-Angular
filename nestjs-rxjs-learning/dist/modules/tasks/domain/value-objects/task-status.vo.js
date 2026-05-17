"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatus = void 0;
const VALID_TRANSITIONS = {
    TODO: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['TODO', 'DONE', 'CANCELLED'],
    DONE: [],
    CANCELLED: [],
};
class TaskStatus {
    value;
    constructor(value) {
        this.value = value;
        Object.freeze(this);
    }
    static create(status) {
        if (!['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'].includes(status)) {
            throw new Error(`Status "${status}" không hợp lệ`);
        }
        return new TaskStatus(status);
    }
    static todo() {
        return new TaskStatus('TODO');
    }
    static inProgress() {
        return new TaskStatus('IN_PROGRESS');
    }
    static done() {
        return new TaskStatus('DONE');
    }
    transitionTo(newStatus) {
        const allowed = VALID_TRANSITIONS[this.value];
        if (!allowed.includes(newStatus)) {
            throw new Error(`Không thể chuyển từ "${this.value}" sang "${newStatus}". ` +
                `Cho phép: [${allowed.join(', ') || 'không có (final state)'}]`);
        }
        return TaskStatus.create(newStatus);
    }
    isCompleted() {
        return this.value === 'DONE';
    }
    isFinal() {
        return this.value === 'DONE' || this.value === 'CANCELLED';
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
exports.TaskStatus = TaskStatus;
//# sourceMappingURL=task-status.vo.js.map
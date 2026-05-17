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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
const swagger_1 = require("@nestjs/swagger");
class ApiResponse {
    success;
    statusCode;
    message;
    data;
    pagination;
    timestamp;
    path;
    static success(data, message = 'Thành công', path = '') {
        const response = new ApiResponse();
        response.success = true;
        response.statusCode = 200;
        response.message = message;
        response.data = data;
        response.timestamp = new Date().toISOString();
        response.path = path;
        return response;
    }
    static error(statusCode, message, path = '') {
        const response = new ApiResponse();
        response.success = false;
        response.statusCode = statusCode;
        response.message = message;
        response.data = null;
        response.timestamp = new Date().toISOString();
        response.path = path;
        return response;
    }
    static paginated(data, pagination, message = 'Thành công', path = '') {
        const response = new ApiResponse();
        response.success = true;
        response.statusCode = 200;
        response.message = message;
        response.data = data;
        response.pagination = pagination;
        response.timestamp = new Date().toISOString();
        response.path = path;
        return response;
    }
}
exports.ApiResponse = ApiResponse;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Kết quả xử lý', example: true }),
    __metadata("design:type", Boolean)
], ApiResponse.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'HTTP status code', example: 200 }),
    __metadata("design:type", Number)
], ApiResponse.prototype, "statusCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Thông báo', example: 'Thành công' }),
    __metadata("design:type", String)
], ApiResponse.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Dữ liệu trả về' }),
    __metadata("design:type", Object)
], ApiResponse.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Metadata phân trang' }),
    __metadata("design:type", Object)
], ApiResponse.prototype, "pagination", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Thời điểm response',
        example: '2024-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "timestamp", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Request path',
        example: '/api/v1/tasks',
    }),
    __metadata("design:type", String)
], ApiResponse.prototype, "path", void 0);
//# sourceMappingURL=api-response.dto.js.map
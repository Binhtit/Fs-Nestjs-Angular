"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BusinessExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const business_exception_1 = require("../exceptions/business.exception");
let BusinessExceptionFilter = BusinessExceptionFilter_1 = class BusinessExceptionFilter {
    logger = new common_1.Logger(BusinessExceptionFilter_1.name);
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception.getStatus();
        const errorResponse = exception.getResponse();
        this.logger.warn(`[${errorResponse.errorCode}] ${errorResponse.message} - ${request.method} ${request.url}`);
        response.status(status).json({
            success: false,
            statusCode: status,
            errorCode: errorResponse.errorCode,
            message: errorResponse.message,
            data: null,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
};
exports.BusinessExceptionFilter = BusinessExceptionFilter;
exports.BusinessExceptionFilter = BusinessExceptionFilter = BusinessExceptionFilter_1 = __decorate([
    (0, common_1.Catch)(business_exception_1.BusinessException)
], BusinessExceptionFilter);
//# sourceMappingURL=business-exception.filter.js.map
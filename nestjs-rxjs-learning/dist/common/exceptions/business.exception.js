"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessException = void 0;
const common_1 = require("@nestjs/common");
class BusinessException extends common_1.HttpException {
    errorCode;
    constructor(errorCode, message, statusCode = common_1.HttpStatus.BAD_REQUEST) {
        super({ errorCode, message }, statusCode);
        this.errorCode = errorCode;
    }
    static unauthorized(errorCode, message) {
        return new BusinessException(errorCode, message, common_1.HttpStatus.UNAUTHORIZED);
    }
    static forbidden(errorCode, message) {
        return new BusinessException(errorCode, message, common_1.HttpStatus.FORBIDDEN);
    }
    static notFound(errorCode, message) {
        return new BusinessException(errorCode, message, common_1.HttpStatus.NOT_FOUND);
    }
    static conflict(errorCode, message) {
        return new BusinessException(errorCode, message, common_1.HttpStatus.CONFLICT);
    }
}
exports.BusinessException = BusinessException;
//# sourceMappingURL=business.exception.js.map
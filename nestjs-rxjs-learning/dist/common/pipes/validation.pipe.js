"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createValidationPipe = void 0;
const common_1 = require("@nestjs/common");
const createValidationPipe = () => {
    return new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    });
};
exports.createValidationPipe = createValidationPipe;
//# sourceMappingURL=validation.pipe.js.map
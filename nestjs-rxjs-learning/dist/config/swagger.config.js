"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSwaggerConfig = void 0;
const swagger_1 = require("@nestjs/swagger");
const createSwaggerConfig = () => {
    return new swagger_1.DocumentBuilder()
        .setTitle('NestJS + RxJS Learning API')
        .setDescription('Dự án học NestJS + RxJS với comment tiếng Việt chi tiết. ' +
        'Mỗi endpoint đều có giải thích concept, WHY, và common mistakes.')
        .setVersion('1.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Nhập JWT access token (không cần prefix "Bearer")',
    }, 'JWT-auth')
        .build();
};
exports.createSwaggerConfig = createSwaggerConfig;
//# sourceMappingURL=swagger.config.js.map
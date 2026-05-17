"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const compression = require('compression');
const helmet_1 = __importDefault(require("helmet"));
const app_module_1 = require("./app.module");
const swagger_config_1 = require("./config/swagger.config");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)());
    app.use(compression());
    app.enableCors({ origin: '*' });
    const configService = app.get(config_1.ConfigService);
    const apiPrefix = configService.get('app.apiPrefix') ?? 'api/v1';
    app.setGlobalPrefix(apiPrefix, {
        exclude: ['health'],
    });
    const swaggerConfig = (0, swagger_config_1.createSwaggerConfig)();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('api-docs', app, document);
    const port = configService.get('app.port') ?? 3000;
    await app.listen(port);
    logger.log(`🚀 Server running on http://localhost:${port}`);
    logger.log(`📚 Swagger docs: http://localhost:${port}/api-docs`);
    logger.log(`💚 Health check: http://localhost:${port}/health`);
    logger.log(`🔌 WebSocket: ws://localhost:${port}/realtime`);
}
bootstrap();
//# sourceMappingURL=main.js.map
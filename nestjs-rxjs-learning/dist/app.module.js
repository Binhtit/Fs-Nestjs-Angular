"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const app_config_1 = __importDefault(require("./config/app.config"));
const database_config_1 = __importDefault(require("./config/database.config"));
const jwt_config_1 = __importDefault(require("./config/jwt.config"));
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const business_exception_filter_1 = require("./common/filters/business-exception.filter");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const response_transform_interceptor_1 = require("./common/interceptors/response-transform.interceptor");
const timeout_interceptor_1 = require("./common/interceptors/timeout.interceptor");
const request_id_middleware_1 = require("./common/middleware/request-id.middleware");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const database_module_1 = require("./database/database.module");
const seed_service_1 = require("./database/seeds/seed.service");
const auth_module_1 = require("./modules/auth/auth.module");
const health_module_1 = require("./modules/health/health.module");
const realtime_module_1 = require("./modules/realtime/realtime.module");
const rxjs_examples_module_1 = require("./modules/rxjs-examples/rxjs-examples.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const users_module_1 = require("./modules/users/users.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const cache_module_1 = require("./shared/cache/cache.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("./modules/users/entities/user.entity");
let AppModule = class AppModule {
    configure(consumer) {
        consumer
            .apply(request_id_middleware_1.RequestIdMiddleware)
            .forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [app_config_1.default, database_config_1.default, jwt_config_1.default],
                envFilePath: '.env',
            }),
            throttler_1.ThrottlerModule.forRoot({
                throttlers: [{ ttl: 60000, limit: 100 }],
            }),
            database_module_1.DatabaseModule,
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.UserEntity]),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tasks_module_1.TasksModule,
            rxjs_examples_module_1.RxjsExamplesModule,
            realtime_module_1.RealtimeModule,
            health_module_1.HealthModule,
            messaging_module_1.MessagingModule,
            cache_module_1.AppCacheModule,
        ],
        providers: [
            seed_service_1.SeedService,
            { provide: core_1.APP_GUARD, useClass: jwt_auth_guard_1.JwtAuthGuard },
            { provide: core_1.APP_GUARD, useClass: roles_guard_1.RolesGuard },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useClass: response_transform_interceptor_1.ResponseTransformInterceptor },
            { provide: core_1.APP_INTERCEPTOR, useValue: new timeout_interceptor_1.TimeoutInterceptor() },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
            { provide: core_1.APP_FILTER, useClass: business_exception_filter_1.BusinessExceptionFilter },
            { provide: core_1.APP_PIPE, useValue: (0, validation_pipe_1.createValidationPipe)() },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
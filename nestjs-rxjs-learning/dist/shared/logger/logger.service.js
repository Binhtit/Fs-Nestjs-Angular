"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLoggerService = void 0;
const common_1 = require("@nestjs/common");
let AppLoggerService = class AppLoggerService {
    logger = new common_1.Logger();
    log(message, context) {
        this.logger.log(message, context);
    }
    error(message, trace, context) {
        this.logger.error(message, trace, context);
    }
    warn(message, context) {
        this.logger.warn(message, context);
    }
    debug(message, context) {
        this.logger.debug(message, context);
    }
    verbose(message, context) {
        this.logger.verbose(message, context);
    }
};
exports.AppLoggerService = AppLoggerService;
exports.AppLoggerService = AppLoggerService = __decorate([
    (0, common_1.Injectable)()
], AppLoggerService);
//# sourceMappingURL=logger.service.js.map
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
exports.RxjsExamplesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const rxjs_examples_service_1 = require("./rxjs-examples.service");
let RxjsExamplesController = class RxjsExamplesController {
    rxjsService;
    constructor(rxjsService) {
        this.rxjsService = rxjsService;
    }
    lesson1() {
        return this.rxjsService.observableVsPromise();
    }
    lesson2() {
        return this.rxjsService.pipeOperators();
    }
    lesson3() {
        return this.rxjsService.higherOrderMapping();
    }
    lesson4() {
        return this.rxjsService.subjects();
    }
    lesson5() {
        return this.rxjsService.combiningStreams();
    }
    lesson6() {
        return this.rxjsService.errorHandling();
    }
    lesson7() {
        return this.rxjsService.rateLimiting();
    }
    lesson8() {
        return this.rxjsService.unsubscribePatterns();
    }
    lesson9() {
        return this.rxjsService.realWorldWebSocket();
    }
};
exports.RxjsExamplesController = RxjsExamplesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 1: Observable vs Promise' }),
    (0, common_1.Get)('observable-vs-promise'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson1", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 2: pipe() và Transformation Operators' }),
    (0, common_1.Get)('pipe-operators'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson2", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 3: mergeMap, switchMap, concatMap, exhaustMap' }),
    (0, common_1.Get)('higher-order-mapping'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson3", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 4: Subject, BehaviorSubject, ReplaySubject' }),
    (0, common_1.Get)('subjects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson4", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 5: combineLatest, forkJoin, zip' }),
    (0, common_1.Get)('combining-streams'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson5", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 6: catchError, retry (Error Handling)' }),
    (0, common_1.Get)('error-handling'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson6", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 7: debounceTime, throttleTime' }),
    (0, common_1.Get)('rate-limiting'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson7", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 8: takeUntil, takeWhile, take, first' }),
    (0, common_1.Get)('unsubscribe-patterns'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson8", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Bài 9: WebSocket + RxJS Real-World Pattern' }),
    (0, common_1.Get)('real-world-websocket'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RxjsExamplesController.prototype, "lesson9", null);
exports.RxjsExamplesController = RxjsExamplesController = __decorate([
    (0, swagger_1.ApiTags)('RxJS Learning'),
    (0, public_decorator_1.Public)(),
    (0, common_1.Controller)('rxjs'),
    __metadata("design:paramtypes", [rxjs_examples_service_1.RxjsExamplesService])
], RxjsExamplesController);
//# sourceMappingURL=rxjs-examples.controller.js.map
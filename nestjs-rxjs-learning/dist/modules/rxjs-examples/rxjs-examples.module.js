"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RxjsExamplesModule = void 0;
const common_1 = require("@nestjs/common");
const rxjs_examples_controller_1 = require("./rxjs-examples.controller");
const rxjs_examples_service_1 = require("./rxjs-examples.service");
let RxjsExamplesModule = class RxjsExamplesModule {
};
exports.RxjsExamplesModule = RxjsExamplesModule;
exports.RxjsExamplesModule = RxjsExamplesModule = __decorate([
    (0, common_1.Module)({
        controllers: [rxjs_examples_controller_1.RxjsExamplesController],
        providers: [rxjs_examples_service_1.RxjsExamplesService],
    })
], RxjsExamplesModule);
//# sourceMappingURL=rxjs-examples.module.js.map
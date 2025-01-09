"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var S3Module_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Module = void 0;
const common_1 = require("@nestjs/common");
const s3_service_1 = require("./s3.service");
let S3Module = S3Module_1 = class S3Module {
    /**
     * @param options The S3 module configuration options
     * @returns Dynamic module configuration
     */
    static register(options) {
        return {
            module: S3Module_1,
            providers: [
                {
                    provide: 'S3_MODULE_OPTIONS',
                    useValue: options,
                },
                s3_service_1.S3Service,
            ],
            exports: [s3_service_1.S3Service],
        };
    }
    /**
     * @param options The async options for S3 module configuration
     * @returns Dynamic module configuration
     */
    static registerAsync(options) {
        return {
            module: S3Module_1,
            imports: options.imports || [],
            providers: [
                ...this.createAsyncProviders(options),
                s3_service_1.S3Service,
            ],
            exports: [s3_service_1.S3Service],
        };
    }
    /**
     * @param options The async options for creating providers
     * @returns Array of providers
     */
    static createAsyncProviders(options) {
        if (options.useExisting || options.useFactory) {
            return [this.createAsyncOptionsProvider(options)];
        }
        if (!options.useClass) {
            throw new Error('useClass is required when not using useExisting or useFactory');
        }
        return [
            this.createAsyncOptionsProvider(options),
            {
                provide: options.useClass,
                useClass: options.useClass,
            },
        ];
    }
    /**
     * @param options The async options for creating the options provider
     * @returns Provider configuration
     */
    static createAsyncOptionsProvider(options) {
        if (options.useFactory) {
            return {
                provide: 'S3_MODULE_OPTIONS',
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
        const injectionToken = options.useExisting || options.useClass;
        if (!injectionToken) {
            throw new Error('useClass or useExisting is required when not using useFactory');
        }
        return {
            provide: 'S3_MODULE_OPTIONS',
            useFactory: async (optionsFactory) => {
                try {
                    return await optionsFactory.createS3ModuleOptions();
                }
                catch (error) {
                    throw new Error(`Failed to create S3 module options: ${error.message}`);
                }
            },
            inject: [injectionToken],
        };
    }
};
exports.S3Module = S3Module;
exports.S3Module = S3Module = S3Module_1 = __decorate([
    (0, common_1.Module)({})
], S3Module);
//# sourceMappingURL=s3.module.js.map
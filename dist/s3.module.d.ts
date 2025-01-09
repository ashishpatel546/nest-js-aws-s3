import { DynamicModule } from '@nestjs/common';
import { S3ModuleOptions, S3ModuleAsyncOptions } from './s3.config';
export declare class S3Module {
    /**
     * @param options The S3 module configuration options
     * @returns Dynamic module configuration
     */
    static register(options: S3ModuleOptions): DynamicModule;
    /**
     * @param options The async options for S3 module configuration
     * @returns Dynamic module configuration
     */
    static registerAsync(options: S3ModuleAsyncOptions): DynamicModule;
    /**
     * @param options The async options for creating providers
     * @returns Array of providers
     */
    private static createAsyncProviders;
    /**
     * @param options The async options for creating the options provider
     * @returns Provider configuration
     */
    private static createAsyncOptionsProvider;
}

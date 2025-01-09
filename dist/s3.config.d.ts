import { ModuleMetadata, Type } from '@nestjs/common';
/**
 * Configuration options for the S3 module
 */
export interface S3ModuleOptions {
    /** AWS S3 region */
    awsS3Region: string;
    /** AWS S3 bucket name */
    awsS3Bucket: string;
    /** AWS S3 access key */
    awsS3Accesskey: string;
    /** AWS S3 secret key */
    awsS3SecretKey: string;
}
/**
 * Factory interface for creating S3ModuleOptions
 */
export interface S3ModuleOptionsFactory {
    createS3ModuleOptions(): Promise<S3ModuleOptions> | S3ModuleOptions;
}
/**
 * Async configuration options for the S3 module
 */
export interface S3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    /** Existing provider to use for creating S3ModuleOptions */
    useExisting?: Type<S3ModuleOptionsFactory>;
    /** Class to instantiate for creating S3ModuleOptions */
    useClass?: Type<S3ModuleOptionsFactory>;
    /** Factory function to create S3ModuleOptions */
    useFactory?: (...args: any[]) => Promise<S3ModuleOptions> | S3ModuleOptions;
    /** Injectable dependencies for the useFactory function */
    inject?: any[];
}

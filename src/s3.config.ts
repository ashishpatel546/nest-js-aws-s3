import { ModuleMetadata, Type } from '@nestjs/common';

export interface S3ModuleOptions {
  awsS3Region: string;
  awsS3Bucket: string;
  awsS3Accesskey: string;
  awsS3SecretKey: string;
}

export interface S3ModuleOptionsFactory {
  createS3ModuleOptions(): Promise<S3ModuleOptions> | S3ModuleOptions;
}

export interface S3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useExisting?: Type<S3ModuleOptionsFactory>;
  useClass?: Type<S3ModuleOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<S3ModuleOptions> | S3ModuleOptions;
  inject?: any[];
}

import { DynamicModule, Module, Provider, Type } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3ModuleOptions, S3ModuleAsyncOptions, S3ModuleOptionsFactory } from './s3.config';

@Module({})
export class S3Module {
  static register(options: S3ModuleOptions): DynamicModule {
    return {
      module: S3Module,
      providers: [
        {
          provide: 'S3_MODULE_OPTIONS',
          useValue: options,
        },
        S3Service,
      ],
      exports: [S3Service],
    };
  }

  static registerAsync(options: S3ModuleAsyncOptions): DynamicModule {
    return {
      module: S3Module,
      imports: options.imports || [],
      providers: [
        ...this.createAsyncProviders(options),
        S3Service,
      ],
      exports: [S3Service],
    };
  }

  private static createAsyncProviders(options: S3ModuleAsyncOptions): Provider[] {
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

  private static createAsyncOptionsProvider(options: S3ModuleAsyncOptions): Provider {
    if (options.useFactory) {
      return {
        provide: 'S3_MODULE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    if (!options.useClass && !options.useExisting) {
      throw new Error('useClass or useExisting is required when not using useFactory');
    }

    const inject = [options.useExisting || options.useClass];

    return {
      provide: 'S3_MODULE_OPTIONS',
      useFactory: async (optionsFactory: S3ModuleOptionsFactory) => {
        try {
          return await optionsFactory.createS3ModuleOptions();
        } catch (error) {
          throw new Error(`Failed to create S3 module options: ${error.message}`);
        }
      },
      inject: inject,
    };
  }
}

import { DynamicModule, Module, Provider } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3ModuleOptions, S3ModuleAsyncOptions, S3ModuleOptionsFactory } from './s3.config';

@Module({})
export class S3Module {
  /**
   * @param options The S3 module configuration options
   * @returns Dynamic module configuration
   */
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

  /**
   * @param options The async options for S3 module configuration
   * @returns Dynamic module configuration
   */
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

  /**
   * @param options The async options for creating providers
   * @returns Array of providers
   */
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

  /**
   * @param options The async options for creating the options provider
   * @returns Provider configuration
   */
  private static createAsyncOptionsProvider(options: S3ModuleAsyncOptions): Provider {
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
      useFactory: async (optionsFactory: S3ModuleOptionsFactory) => {
        try {
          return await optionsFactory.createS3ModuleOptions();
        } catch (error) {
          throw new Error(`Failed to create S3 module options: ${error.message}`);
        }
      },
      inject: [injectionToken],
    };
  }
}

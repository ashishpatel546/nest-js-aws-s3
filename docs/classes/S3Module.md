[@solegence/nest-js-aws-s3](../README.md) / S3Module

# Class: S3Module

## Table of contents

### Constructors

- [constructor](S3Module.md#constructor)

### Methods

- [register](S3Module.md#register)
- [registerAsync](S3Module.md#registerasync)

## Constructors

### constructor

• **new S3Module**(): [`S3Module`](S3Module.md)

#### Returns

[`S3Module`](S3Module.md)

## Methods

### register

▸ **register**(`options`): `DynamicModule`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`S3ModuleOptions`](../interfaces/S3ModuleOptions.md) | The S3 module configuration options |

#### Returns

`DynamicModule`

Dynamic module configuration

#### Defined in

s3.module.ts:11

___

### registerAsync

▸ **registerAsync**(`options`): `DynamicModule`

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | `S3ModuleAsyncOptions` | The async options for S3 module configuration |

#### Returns

`DynamicModule`

Dynamic module configuration

#### Defined in

s3.module.ts:29

[@solegence/nest-js-aws-s3](../README.md) / S3Service

# Class: S3Service

## Implements

- `OnModuleInit`

## Table of contents

### Constructors

- [constructor](S3Service.md#constructor)

### Methods

- [deleteMultipleObjects](S3Service.md#deletemultipleobjects)
- [getBucketObjects](S3Service.md#getbucketobjects)
- [getSignedUrl](S3Service.md#getsignedurl)
- [onModuleInit](S3Service.md#onmoduleinit)
- [uploadCsvToS3InChunks](S3Service.md#uploadcsvtos3inchunks)
- [uploadFile](S3Service.md#uploadfile)
- [uploadFileInPdf](S3Service.md#uploadfileinpdf)
- [uploadfileInCsv](S3Service.md#uploadfileincsv)

## Constructors

### constructor

• **new S3Service**(`options`): [`S3Service`](S3Service.md)

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`S3ModuleOptions`](../interfaces/S3ModuleOptions.md) | The S3 module configuration options |

#### Returns

[`S3Service`](S3Service.md)

#### Defined in

s3.service.ts:38

## Methods

### deleteMultipleObjects

▸ **deleteMultipleObjects**(`keys`): `Promise`\<`DeleteObjectCommandOutput`[]\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keys` | `string`[] | Array of object keys to delete |

#### Returns

`Promise`\<`DeleteObjectCommandOutput`[]\>

Promise that resolves when all objects are deleted

#### Defined in

s3.service.ts:309

___

### getBucketObjects

▸ **getBucketObjects**(`keyOrPrefix`): `Promise`\<`ListObjectsCommandOutput`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `keyOrPrefix` | `string` | The key or prefix to list objects for |

#### Returns

`Promise`\<`ListObjectsCommandOutput`\>

Promise with the list of objects

#### Defined in

s3.service.ts:328

___

### getSignedUrl

▸ **getSignedUrl**(`key`, `expires?`): `Promise`\<`string`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The object key to generate URL for |
| `expires?` | `number` | Number of seconds until URL expires |

#### Returns

`Promise`\<`string`\>

Promise with the signed URL

#### Defined in

s3.service.ts:287

___

### onModuleInit

▸ **onModuleInit**(): `void`

#### Returns

`void`

#### Implementation of

OnModuleInit.onModuleInit

#### Defined in

s3.service.ts:344

___

### uploadCsvToS3InChunks

▸ **uploadCsvToS3InChunks**(`key`, `data`): `Promise`\<`void`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `string` | The object key in the bucket |
| `data` | `CsvData`[] | Array of objects to upload as CSV |

#### Returns

`Promise`\<`void`\>

Promise that resolves when upload is complete

#### Defined in

s3.service.ts:206

___

### uploadFile

▸ **uploadFile**(`bucket`, `key`, `body`): `Promise`\<`PutObjectCommandOutput`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `bucket` | `string` | The S3 bucket name |
| `key` | `string` | The object key/path in the bucket |
| `body` | `Buffer` \| `Readable` | The file content to upload |

#### Returns

`Promise`\<`PutObjectCommandOutput`\>

Promise with the upload response

#### Defined in

s3.service.ts:55

___

### uploadFileInPdf

▸ **uploadFileInPdf**(`filename`, `fileBuffer`): `Promise`\<`PutObjectCommandOutput`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filename` | `string` | The name of the PDF file |
| `fileBuffer` | `Buffer` | The PDF file content as Buffer |

#### Returns

`Promise`\<`PutObjectCommandOutput`\>

Promise with the upload response

#### Defined in

s3.service.ts:80

___

### uploadfileInCsv

▸ **uploadfileInCsv**(`filename`, `fileBuffer`): `Promise`\<`PutObjectCommandOutput`\>

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `filename` | `string` | The name of the CSV file |
| `fileBuffer` | `string` \| `Buffer` | The CSV content as string or Buffer |

#### Returns

`Promise`\<`PutObjectCommandOutput`\>

Promise with the upload response

#### Defined in

s3.service.ts:105

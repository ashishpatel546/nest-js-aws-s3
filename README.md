# NestJS AWS S3 Module Integration

A powerful and flexible AWS S3 integration module for NestJS applications with support for file uploads, signed URLs, and bucket operations.

## Features

- Easy integration with AWS S3
- File upload support (PDF, CSV, and other formats)
- Chunked CSV uploads for large datasets
- Signed URL generation
- Bucket operations (list, delete)
- TypeScript support
- Configurable through environment variables

## Installation

```bash
npm install @solegence/nest-js-aws-s3
```

## Configuration

### Environment Variables

Create a `.env` file in your project root:

```env
AWS_S3_REGION=your-region
AWS_S3_BUCKET=your-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

### Module Registration

There are two ways to register the S3Module:

#### 1. Synchronous Registration

```typescript
import { S3Module } from '@solegence/nest-js-aws-s3';

@Module({
  imports: [
    S3Module.register({
      awsS3Region: process.env.AWS_S3_REGION,
      awsS3Bucket: process.env.AWS_S3_BUCKET,
      awsS3Accesskey: process.env.AWS_ACCESS_KEY_ID,
      awsS3SecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      isGlobal: true, // optional: make the module global
    }),
  ],
})
export class AppModule {}
```

#### 2. Asynchronous Registration

```typescript
import { S3Module } from '@solegence/nest-js-aws-s3';
import { ConfigService, ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    S3Module.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        awsS3Region: configService.get('AWS_S3_REGION'),
        awsS3Bucket: configService.get('AWS_S3_BUCKET'),
        awsS3Accesskey: configService.get('AWS_ACCESS_KEY_ID'),
        awsS3SecretKey: configService.get('AWS_SECRET_ACCESS_KEY'),
        isGlobal: true, // optional: make the module global
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

You can also use `useClass` or `useExisting` instead of `useFactory`:

```typescript
// Using useClass
S3Module.registerAsync({
  useClass: S3ConfigService, // Your custom config service that implements S3ModuleOptionsFactory
});

// Using useExisting
S3Module.registerAsync({
  useExisting: ConfigService, // Existing provider that implements S3ModuleOptionsFactory
});
```

## Usage Examples

### Basic File Upload

```typescript
async uploadSingleFile(filename: string, buffer: Buffer) {
  return await this.s3Service.uploadFile(this.AWS_S3_BUCKET, filename, buffer);
}
```

### Converting and Uploading CSV Data

```typescript
// Convert array of objects to CSV and upload
const data = [
  { name: 'John', age: 30, city: 'New York' },
  { name: 'Jane', age: 25, city: 'London' }
];

// With headers (default)
await s3Service.convertAndUploadCsv('users.csv', data);

// Without headers
await s3Service.convertAndUploadCsv('users.csv', data, false);
```

### Uploading Files

```typescript
@Injectable()
export class YourService {
  constructor(private readonly s3Service: S3Service) {}

  async uploadPdf(filename: string, buffer: Buffer) {
    try {
      const result = await this.s3Service.uploadFileInPdf(filename, buffer);
      return result;
    } catch (error) {
      throw new Error(`Failed to upload PDF: ${error.message}`);
    }
  }
}
```

### Generating Signed URLs

```typescript
async getFileUrl(key: string) {
  const url = await this.s3Service.getSignedUrl(key, 3600); // Expires in 1 hour
  return url;
}
```

### Chunked CSV Upload

```typescript
async uploadLargeCsv(key: string, data: any[]) {
  await this.s3Service.uploadCsvToS3InChunks(key, data);
}
```

## API Reference

### S3Service Methods

| Method | Description | Parameters | Return Type |
|--------|-------------|------------|-------------|
| uploadFile | Generic file upload | bucket: string, key: string, body: Buffer \| Readable | Promise<PutObjectCommandOutput> |
| uploadFileInPdf | PDF file upload | filename: string, fileBuffer: Buffer | Promise<PutObjectCommandOutput> |
| uploadfileInCsv | CSV file upload | filename: string, fileBuffer: string \| Buffer | Promise<PutObjectCommandOutput> |
| convertAndUploadCsv | Convert data to CSV and upload | filename: string, data: CsvData[], includeHeader?: boolean | Promise<PutObjectCommandOutput> |
| uploadCsvToS3InChunks | Large CSV upload in chunks | key: string, data: CsvData[] | Promise<void> |
| getSignedUrl | Generate presigned URL | key: string, expires?: number | Promise<string> |
| deleteMultipleObjects | Delete multiple objects | keys: string[] | Promise<DeleteObjectCommandOutput[]> |
| getBucketObjects | List bucket objects | keyOrPrefix: string | Promise<ListObjectsCommandOutput> |

## Best Practices

### File Upload Recommendations

1. **Content Type Selection**
   - Use appropriate methods for specific file types:
     - `uploadFileInPdf` for PDF files
     - `uploadfileInCsv` for CSV files
     - `uploadFile` for generic files

2. **Large Dataset Handling**
   - Use `uploadCsvToS3InChunks` for large datasets
   - Use `convertAndUploadCsv` for smaller datasets

3. **Error Handling**
```typescript
try {
  await s3Service.uploadFileInPdf('document.pdf', buffer);
} catch (error) {
  // Handle specific error types
  if (error.name === 'NoSuchBucket') {
    // Handle bucket not found
  } else if (error.$metadata?.httpStatusCode === 403) {
    // Handle permission issues
  }
}
```

## Type Definitions

### CsvData Interface

```typescript
interface CsvData extends Record<string, any> {
  headers?: string[];
  rows?: any[][];
  [key: string]: string | number | boolean | null | string[] | any[][] | undefined;
}
```

## Troubleshooting

### Common Issues

1. **Access Denied Errors**
   - Verify AWS credentials are correct
   - Check IAM permissions for the provided access key

2. **Upload Failures**
   - Ensure bucket name is correct
   - Verify file size is within limits
   - Check network connectivity

3. **Missing Credentials**
   - Ensure environment variables are properly set
   - Verify module registration includes all required options

## Performance Optimization

1. **Large File Uploads**
   - Use multipart uploads for files > 100MB
   - Implement chunked uploads for large CSV datasets
   - Consider compression for large files

2. **Bucket Organization**
   - Use meaningful prefixes for better organization
   - Implement lifecycle policies for cost optimization
   - Use appropriate storage classes based on access patterns

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

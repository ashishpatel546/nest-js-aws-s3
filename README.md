# NestJS AWS S3 Module

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

```typescript
import { S3Module } from '@solegence/nest-js-aws-s3';

@Module({
  imports: [
    S3Module.register({
      awsS3Region: process.env.AWS_S3_REGION,
      awsS3Bucket: process.env.AWS_S3_BUCKET,
      awsS3Accesskey: process.env.AWS_ACCESS_KEY_ID,
      awsS3SecretKey: process.env.AWS_SECRET_ACCESS_KEY,
    }),
  ],
})
export class AppModule {}
```

## Usage Examples

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
| uploadCsvToS3InChunks | Large CSV upload in chunks | key: string, data: CsvData[] | Promise<void> |
| getSignedUrl | Generate presigned URL | key: string, expires?: number | Promise<string> |
| deleteMultipleObjects | Delete multiple objects | keys: string[] | Promise<DeleteObjectCommandOutput[]> |
| getBucketObjects | List bucket objects | keyOrPrefix: string | Promise<ListObjectsCommandOutput> |

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

## Contributing

Contributions are welcome! Please feel free to submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

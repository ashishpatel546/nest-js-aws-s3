// Add interface before class definition
interface CsvData {
  [key: string]: string | number | boolean | null;
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  UploadPartCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  CompleteMultipartUploadOutput,
  CompletedPart,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { S3ModuleOptions } from './s3.config';
import { stringify } from 'csv-stringify';

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3Client;
  private logger = new Logger(S3Service.name);
  private readonly AWS_S3_BUCKET: string;

  constructor(private readonly options: S3ModuleOptions) {
    this.AWS_S3_BUCKET = options.awsS3Bucket;
  }

  async uploadFile(bucket: string, key: string, body: Buffer | Readable) {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
    });

    try {
      const response = await this.s3.send(command);
      return response;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async uploadFileInPdf(filename: string, fileBuffer: Buffer) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: filename,
      Body: fileBuffer,
      ContentType: 'application/pdf',
    };
    const command = new PutObjectCommand(params);
    try {
      const response = await this.s3.send(command);
      return response;
    } catch (error) {
      this.logger.error('error while uploading file on s3');
      this.logger.error(error);
    }
  }

  async uploadfileInCsv(filename: string, fileBuffer: string | Buffer) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: filename,
      Body: fileBuffer,
      contentType: 'text/csv',
    };
    const command = new PutObjectCommand(params);
    try {
      const response = await this.s3.send(command);
      return response;
    } catch (error) {
      this.logger.error('error while uploading file on s3');
      this.logger.error(error);
      throw error; // Add return statement
    }
  }

  private async uploadMultipartPart(
    uploadId: string,
    partNumber: number,
    data: string,
    key: string,
  ): Promise<CompleteMultipartUploadOutput> {
    const command = new UploadPartCommand({
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
      PartNumber: partNumber,
      UploadId: uploadId,
      Body: data,
    });
    try {
      const result = await this.s3.send(command);
      this.logger.log(
        `Upload part result Status code: ${result?.$metadata?.httpStatusCode}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Unable to upload file in parts on s3');
      this.logger.error(error.message);
      throw error; // Add return statement
    }
  }

  // Fix function syntax - remove 'function' keyword
  private async createCsvString(
    data: CsvData[],
    includeHeader: boolean,
  ): Promise<string> {
    // Replace null values with empty strings
    const dataWithEmptyStrings = data.map((obj) => {
      const newObj: { [key: string]: string | number | boolean | null } = {};
      for (const key in obj) {
        // Fix the length check by properly type guarding
        const value = obj[key];
        newObj[key] = value !== null && value !== undefined ? 
          (typeof value === 'string' && value.length === 0 ? ' ' : value) : 
          ' ';
      }
      return newObj;
    });

    return new Promise<string>((resolve, reject) => {
      stringify(
        dataWithEmptyStrings,
        { header: includeHeader, quoted_empty: true },
        (err, csvString) => {
          if (err) {
            reject(err);
          } else {
            resolve(csvString || ''); // Handle undefined case
          }
        },
      );
    });
  }

  async uploadCsvToS3InChunks(key: string, data: CsvData[]): Promise<void> {
    const bucket = this.AWS_S3_BUCKET;
    const chunkSize = 100000;
    const totalItems = data.length;
    let start = 0;
    let processed = 0;

    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: key,
        ContentType: 'text/csv',
      });
      const multipartUpload = await this.s3.send(command);
      if(!multipartUpload.UploadId) {
        throw new Error('Failed to get UploadId from multipart upload');
      }
      const uploadedParts: CompletedPart[] = [];

      try {
        while (processed < totalItems) {
          const end = Math.min(start + chunkSize, totalItems);
          const currentChunk = data.slice(start, end) as CsvData[];
          const csvString = await this.createCsvString(currentChunk, start === 0);

          if (!csvString) {
            throw new Error('Failed to create CSV string');
          }

          const partNumber = uploadedParts.length + 1;
          const uploadedPart = await this.uploadMultipartPart(
            multipartUpload.UploadId,
            partNumber,
            csvString,
            key,
          );

          if (!uploadedPart.ETag) {
            throw new Error('Failed to get ETag from uploaded part');
          }

          uploadedParts.push({
            PartNumber: partNumber,
            ETag: uploadedPart.ETag,
          });

          start = end;
          processed += currentChunk.length;
        }

        const completeCommand = new CompleteMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          MultipartUpload: { Parts: uploadedParts },
          UploadId: multipartUpload.UploadId,
        });
        await this.s3.send(completeCommand);
      } catch (err) {
        const abortCommand = new AbortMultipartUploadCommand({
          Bucket: bucket,
          Key: key,
          UploadId: multipartUpload.UploadId,
        });
        await this.s3.send(abortCommand);
        this.logger.error(err.message);
        throw err;
      }
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  async getSignedUrl(key: string, expires?: number) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Key: key,
    };
    try {
      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(this.s3, command, { expiresIn: expires });
      return url;
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  deleteMultipleObjects(keys: string[]) {
    return Promise.all(
      keys.map((key) => {
        const params = {
          Bucket: this.AWS_S3_BUCKET,
          Key: key,
        };
        const command = new DeleteObjectCommand(params);
        return this.s3.send(command);
      }),
    );
  }

  async getBucketObjects(keyOrPrefix: string) {
    const params = {
      Bucket: this.AWS_S3_BUCKET,
      Prefix: keyOrPrefix,
    };
    try {
      const command = new ListObjectsCommand(params);
      return this.s3.send(command);
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }

  onModuleInit() {
    try {
      this.s3 = new S3Client({
        region: this.options.awsS3Region,
        credentials: {
          accessKeyId: this.options.awsS3Accesskey,
          secretAccessKey: this.options.awsS3SecretKey,
        },
      });
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}

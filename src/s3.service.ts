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

/**
 * Interface for CSV data structure
 */
export interface CsvData extends Record<string, any> {
  headers?: string[];
  rows?: any[][];
  [key: string]: string | number | boolean | null | string[] | any[][] | undefined;
}

@Injectable()
export class S3Service implements OnModuleInit {
  private s3: S3Client;
  private logger = new Logger(S3Service.name);
  private readonly AWS_S3_BUCKET: string;

  /**
   * @param options The S3 module configuration options
   */
  constructor(private readonly options: S3ModuleOptions) {
    this.AWS_S3_BUCKET = options.awsS3Bucket;
    this.s3 = new S3Client({
      region: options.awsS3Region,
      credentials: {
        accessKeyId: options.awsS3Accesskey,
        secretAccessKey: options.awsS3SecretKey,
      },
    });
  }

  /**
   * @param bucket The S3 bucket name
   * @param key The object key/path in the bucket
   * @param body The file content to upload
   * @returns Promise with the upload response
   */
  async uploadFile(
    bucket: string,
    key: string,
    body: Buffer | Readable
  ) {
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

  /**
   * @param filename The name of the PDF file
   * @param fileBuffer The PDF file content as Buffer
   * @returns Promise with the upload response
   */
  async uploadFileInPdf(
    filename: string,
    fileBuffer: Buffer
  ) {
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

  /**
   * @param filename The name of the CSV file
   * @param fileBuffer The CSV content as string or Buffer
   * @returns Promise with the upload response
   */
  async uploadfileInCsv(
    filename: string,
    fileBuffer: string | Buffer
  ) {
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

  /**
   * @param uploadId The multipart upload ID
   * @param partNumber The part number in the sequence
   * @param data The data chunk to upload
   * @param key The object key in the bucket
   * @returns Promise with the upload response
   */
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

  /**
   * @param data Array of objects to convert to CSV
   * @param includeHeader Whether to include headers in CSV
   * @returns Promise with the CSV string
   */
  private async createCsvString(
    data: CsvData[],
    includeHeader: boolean,
  ): Promise<string> {
    // Replace null values with empty strings and convert arrays to strings
    const dataWithEmptyStrings = data.map((obj) => {
      const newObj: { [key: string]: string | number | boolean } = {};
      for (const key in obj) {
        const value = obj[key];
        if (value === null || value === undefined) {
          newObj[key] = ' ';
        } else if (Array.isArray(value)) {
          newObj[key] = value.join(','); // Convert arrays to comma-separated strings
        } else if (typeof value === 'string' && value.length === 0) {
          newObj[key] = ' ';
        } else {
          newObj[key] = value as string | number | boolean;
        }
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
            resolve(csvString || '');
          }
        },
      );
    });
  }

  /**
   * @param key The object key in the bucket
   * @param data Array of objects to upload as CSV
   * @returns Promise that resolves when upload is complete
   */
  async uploadCsvToS3InChunks(
    key: string,
    data: CsvData[]
  ): Promise<void> {
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

  /**
   * @param key The object key to generate URL for
   * @param expires Number of seconds until URL expires
   * @returns Promise with the signed URL
   */
  async getSignedUrl(
    key: string,
    expires?: number
  ) {
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

  /**
   * @param keys Array of object keys to delete
   * @returns Promise that resolves when all objects are deleted
   */
  deleteMultipleObjects(
    keys: string[]
  ) {
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

  /**
   * @param keyOrPrefix The key or prefix to list objects for
   * @returns Promise with the list of objects
   */
  async getBucketObjects(
    keyOrPrefix: string
  ) {
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

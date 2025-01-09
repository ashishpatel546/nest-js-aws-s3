/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import { OnModuleInit } from '@nestjs/common';
import { Readable } from 'stream';
import { S3ModuleOptions } from './s3.config';
/**
 * Interface for CSV data structure
 */
export interface CsvData extends Record<string, any> {
    headers?: string[];
    rows?: any[][];
    [key: string]: string | number | boolean | null | string[] | any[][] | undefined;
}
export declare class S3Service implements OnModuleInit {
    private readonly options;
    private s3;
    private logger;
    private readonly AWS_S3_BUCKET;
    /**
     * @param options The S3 module configuration options
     */
    constructor(options: S3ModuleOptions);
    /**
     * @param bucket The S3 bucket name
     * @param key The object key/path in the bucket
     * @param body The file content to upload
     * @returns Promise with the upload response
     */
    uploadFile(bucket: string, key: string, body: Buffer | Readable): Promise<import("@aws-sdk/client-s3").PutObjectCommandOutput>;
    /**
     * @param filename The name of the PDF file
     * @param fileBuffer The PDF file content as Buffer
     * @returns Promise with the upload response
     */
    uploadFileInPdf(filename: string, fileBuffer: Buffer): Promise<import("@aws-sdk/client-s3").PutObjectCommandOutput>;
    /**
     * @param filename The name of the CSV file
     * @param fileBuffer The CSV content as string or Buffer
     * @returns Promise with the upload response
     */
    uploadfileInCsv(filename: string, fileBuffer: string | Buffer): Promise<import("@aws-sdk/client-s3").PutObjectCommandOutput>;
    /**
     * @param uploadId The multipart upload ID
     * @param partNumber The part number in the sequence
     * @param data The data chunk to upload
     * @param key The object key in the bucket
     * @returns Promise with the upload response
     */
    private uploadMultipartPart;
    /**
     * @param data Array of objects to convert to CSV
     * @param includeHeader Whether to include headers in CSV
     * @returns Promise with the CSV string
     */
    private createCsvString;
    /**
     * @param key The object key in the bucket
     * @param data Array of objects to upload as CSV
     * @returns Promise that resolves when upload is complete
     */
    uploadCsvToS3InChunks(key: string, data: CsvData[]): Promise<void>;
    /**
     * @param key The object key to generate URL for
     * @param expires Number of seconds until URL expires
     * @returns Promise with the signed URL
     */
    getSignedUrl(key: string, expires?: number): Promise<string>;
    /**
     * @param keys Array of object keys to delete
     * @returns Promise that resolves when all objects are deleted
     */
    deleteMultipleObjects(keys: string[]): Promise<import("@aws-sdk/client-s3").DeleteObjectCommandOutput[]>;
    /**
     * @param keyOrPrefix The key or prefix to list objects for
     * @returns Promise with the list of objects
     */
    getBucketObjects(keyOrPrefix: string): Promise<import("@aws-sdk/client-s3").ListObjectsCommandOutput>;
    onModuleInit(): void;
}

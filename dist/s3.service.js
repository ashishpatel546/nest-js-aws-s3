"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var S3Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Service = void 0;
const common_1 = require("@nestjs/common");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const csv_stringify_1 = require("csv-stringify");
let S3Service = S3Service_1 = class S3Service {
    /**
     * @param options The S3 module configuration options
     */
    constructor(options) {
        this.options = options;
        this.logger = new common_1.Logger(S3Service_1.name);
        this.logger.debug('Initializing S3 client...');
        try {
            this.AWS_S3_BUCKET = options.awsS3Bucket;
            this.s3 = new client_s3_1.S3Client({
                region: options.awsS3Region,
                credentials: {
                    accessKeyId: options.awsS3Accesskey,
                    secretAccessKey: options.awsS3SecretKey,
                },
            });
            this.logger.log('S3 client successfully initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize S3 client');
            this.logger.error(error.message);
            throw error;
        }
    }
    /**
     * @param bucket The S3 bucket name
     * @param key The object key/path in the bucket
     * @param body The file content to upload
     * @returns Promise with the upload response
     */
    async uploadFile(bucket, key, body) {
        this.logger.log(`Starting file upload to bucket: ${bucket}, key: ${key}`);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
        });
        try {
            const response = await this.s3.send(command);
            this.logger.log(`File successfully uploaded to ${key}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to upload file to ${key}`);
            this.logger.error(error);
            throw error;
        }
    }
    /**
     * @param filename The name of the PDF file
     * @param fileBuffer The PDF file content as Buffer
     * @returns Promise with the upload response
     */
    async uploadFileInPdf(filename, fileBuffer) {
        this.logger.log(`Starting PDF upload: ${filename}`);
        const params = {
            Bucket: this.AWS_S3_BUCKET,
            Key: filename,
            Body: fileBuffer,
            ContentType: 'application/pdf',
        };
        const command = new client_s3_1.PutObjectCommand(params);
        try {
            const response = await this.s3.send(command);
            this.logger.log(`PDF file successfully uploaded: ${filename}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to upload PDF file: ${filename}`);
            this.logger.error('error while uploading file on s3');
            this.logger.error(error);
        }
    }
    /**
     * @param filename The name of the CSV file
     * @param fileBuffer The CSV content as string or Buffer
     * @returns Promise with the upload response
     */
    async uploadfileInCsv(filename, fileBuffer) {
        this.logger.log(`Starting CSV upload: ${filename}`);
        const params = {
            Bucket: this.AWS_S3_BUCKET,
            Key: filename,
            Body: fileBuffer,
            contentType: 'text/csv',
        };
        const command = new client_s3_1.PutObjectCommand(params);
        try {
            const response = await this.s3.send(command);
            this.logger.log(`CSV file successfully uploaded: ${filename}`);
            return response;
        }
        catch (error) {
            this.logger.error(`Failed to upload CSV file: ${filename}`);
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
    async uploadMultipartPart(uploadId, partNumber, data, key) {
        var _a;
        this.logger.log(`Uploading part ${partNumber} for ${key} (Upload ID: ${uploadId})`);
        const command = new client_s3_1.UploadPartCommand({
            Bucket: this.AWS_S3_BUCKET,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
            Body: data,
        });
        try {
            const result = await this.s3.send(command);
            this.logger.log(`Successfully uploaded part ${partNumber} for ${key}`);
            this.logger.log(`Upload part result Status code: ${(_a = result === null || result === void 0 ? void 0 : result.$metadata) === null || _a === void 0 ? void 0 : _a.httpStatusCode}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to upload part ${partNumber} for ${key}`);
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
    async createCsvString(data, includeHeader) {
        // Replace null values with empty strings and convert arrays to strings
        const dataWithEmptyStrings = data.map((obj) => {
            const newObj = {};
            for (const key in obj) {
                const value = obj[key];
                if (value === null || value === undefined) {
                    newObj[key] = ' ';
                }
                else if (Array.isArray(value)) {
                    newObj[key] = value.join(','); // Convert arrays to comma-separated strings
                }
                else if (typeof value === 'string' && value.length === 0) {
                    newObj[key] = ' ';
                }
                else {
                    newObj[key] = value;
                }
            }
            return newObj;
        });
        return new Promise((resolve, reject) => {
            (0, csv_stringify_1.stringify)(dataWithEmptyStrings, { header: includeHeader, quoted_empty: true }, (err, csvString) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(csvString || '');
                }
            });
        });
    }
    /**
     * @param key The object key in the bucket
     * @param data Array of objects to upload as CSV
     * @returns Promise that resolves when upload is complete
     */
    async uploadCsvToS3InChunks(key, data) {
        this.logger.log(`Starting chunked CSV upload: ${key} with ${data.length} records`);
        const bucket = this.AWS_S3_BUCKET;
        const chunkSize = 100000;
        const totalItems = data.length;
        let start = 0;
        let processed = 0;
        try {
            const command = new client_s3_1.CreateMultipartUploadCommand({
                Bucket: bucket,
                Key: key,
                ContentType: 'text/csv',
            });
            this.logger.log('Initiating multipart upload...');
            const multipartUpload = await this.s3.send(command);
            if (!multipartUpload.UploadId) {
                throw new Error('Failed to get UploadId from multipart upload');
            }
            const uploadedParts = [];
            try {
                while (processed < totalItems) {
                    const end = Math.min(start + chunkSize, totalItems);
                    const currentChunk = data.slice(start, end);
                    const csvString = await this.createCsvString(currentChunk, start === 0);
                    if (!csvString) {
                        throw new Error('Failed to create CSV string');
                    }
                    const partNumber = uploadedParts.length + 1;
                    const uploadedPart = await this.uploadMultipartPart(multipartUpload.UploadId, partNumber, csvString, key);
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
                const completeCommand = new client_s3_1.CompleteMultipartUploadCommand({
                    Bucket: bucket,
                    Key: key,
                    MultipartUpload: { Parts: uploadedParts },
                    UploadId: multipartUpload.UploadId,
                });
                await this.s3.send(completeCommand);
                this.logger.log(`Completed chunked CSV upload for ${key}`);
            }
            catch (err) {
                const abortCommand = new client_s3_1.AbortMultipartUploadCommand({
                    Bucket: bucket,
                    Key: key,
                    UploadId: multipartUpload.UploadId,
                });
                await this.s3.send(abortCommand);
                this.logger.error(err.message);
                throw err;
            }
        }
        catch (error) {
            this.logger.error(`Failed chunked CSV upload for ${key}`);
            this.logger.error(error.message);
            throw error;
        }
    }
    /**
     * @param key The object key to generate URL for
     * @param expires Number of seconds until URL expires
     * @returns Promise with the signed URL
     */
    async getSignedUrl(key, expires) {
        this.logger.log(`Generating signed URL for ${key}`);
        const params = {
            Bucket: this.AWS_S3_BUCKET,
            Key: key,
        };
        try {
            const command = new client_s3_1.GetObjectCommand(params);
            const url = await (0, s3_request_presigner_1.getSignedUrl)(this.s3, command, { expiresIn: expires });
            this.logger.log(`Generated signed URL for ${key}`);
            return url;
        }
        catch (error) {
            this.logger.error(`Failed to generate signed URL for ${key}`);
            this.logger.error(error.message);
            throw error;
        }
    }
    /**
     * @param keys Array of object keys to delete
     * @returns Promise that resolves when all objects are deleted
     */
    async deleteMultipleObjects(keys) {
        this.logger.log(`Deleting ${keys.length} objects`);
        return Promise.all(keys.map((key) => {
            this.logger.log(`Deleting object: ${key}`);
            const params = {
                Bucket: this.AWS_S3_BUCKET,
                Key: key,
            };
            const command = new client_s3_1.DeleteObjectCommand(params);
            return this.s3.send(command);
        }));
    }
    /**
     * @param keyOrPrefix The key or prefix to list objects for
     * @returns Promise with the list of objects
     */
    async getBucketObjects(keyOrPrefix) {
        this.logger.log(`Listing objects with prefix: ${keyOrPrefix}`);
        const params = {
            Bucket: this.AWS_S3_BUCKET,
            Prefix: keyOrPrefix,
        };
        try {
            const command = new client_s3_1.ListObjectsCommand(params);
            const result = await this.s3.send(command);
            this.logger.log(`Successfully listed objects with prefix: ${keyOrPrefix}`);
            return result;
        }
        catch (error) {
            this.logger.error(`Failed to list objects with prefix: ${keyOrPrefix}`);
            this.logger.error(error.message);
            throw error;
        }
    }
};
exports.S3Service = S3Service;
exports.S3Service = S3Service = S3Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('S3_MODULE_OPTIONS')),
    __metadata("design:paramtypes", [Object])
], S3Service);
//# sourceMappingURL=s3.service.js.map
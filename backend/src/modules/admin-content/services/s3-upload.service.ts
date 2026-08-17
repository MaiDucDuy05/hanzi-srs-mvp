import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3UploadService {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME') || 'hanzi-srs-bucket';
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION') || 'ap-southeast-1',
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID') || '',
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY') || '',
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
    try {
      const ext = path.extname(file.originalname);
      const filename = `${folder}/${uuidv4()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: filename,
        Body: file.buffer,
        ContentType: file.mimetype,
        // ACL: 'public-read', // Deprecated in some modern S3 setups
      });

      await this.s3Client.send(command);

      const region = await this.s3Client.config.region();
      return `https://${this.bucketName}.s3.${region}.amazonaws.com/${filename}`;
    } catch (error) {
      console.error('S3 Upload Error:', error);
      throw new InternalServerErrorException('Không thể tải file lên S3');
    }
  }
}

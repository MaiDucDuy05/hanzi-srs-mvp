import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || '';
    
    // AWS SDK automatically uses AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY from env
    const s3Config: any = {
      region: process.env.AWS_REGION || 'ap-southeast-1',
    };

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      s3Config.credentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      };
    }

    this.s3Client = new S3Client(s3Config);
  }

  /**
   * Sinh URL cho phép người dùng TẢI LÊN tệp (PUT)
   * @param key Đường dẫn lưu trên S3 (vd: documents/vip/file.pdf)
   * @param contentType MIME type (vd: application/pdf)
   * @param expiresIn Số giây URL có hiệu lực
   */
  async generateUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: contentType,
      });

      // Tạo presigned URL cho PUT request
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating S3 upload URL:', error);
      throw new InternalServerErrorException('Could not generate upload URL');
    }
  }

  /**
   * Sinh URL cho phép người dùng TẢI XUỐNG / XEM tệp (GET)
   * @param key Đường dẫn lưu trên S3 (vd: documents/vip/file.pdf)
   * @param expiresIn Số giây URL có hiệu lực
   */
  async generateDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      // Tạo presigned URL cho GET request
      return await getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error) {
      console.error('Error generating S3 download URL:', error);
      throw new InternalServerErrorException('Could not generate download URL');
    }
  }
}

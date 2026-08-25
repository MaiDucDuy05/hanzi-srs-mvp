import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DataSource } from 'typeorm';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  constructor(private readonly dataSource: DataSource) {}

  private async logToDb(jobName: string, errorMessage: string) {
    try {
      await this.dataSource.query(
        `INSERT INTO system_job_logs (job_name, status, last_run, error_message, created_at, updated_at) 
         VALUES ($1, 'ERROR', NOW(), $2, NOW(), NOW())`,
        [jobName, errorMessage]
      );
    } catch (e) {
      this.logger.error('Failed to log error to system_job_logs', e);
    }
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message =
        typeof exResponse === 'string'
          ? exResponse
          : (exResponse as Record<string, unknown>).message?.toString() || exception.message;
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    // Ghi log vào DB nếu là lỗi 500 hoặc 429 (Ví dụ: Gemini Too Many Requests)
    if (status >= 500 || status === 429) {
      const source = status === 429 ? 'External Service API' : 'Internal System Error';
      const truncatedMessage = message.substring(0, 1000); // Tránh tràn cột text
      this.logToDb(`${source} - ${request.method} ${request.url}`, truncatedMessage).catch(err => {
        this.logger.error('Error saving system_job_logs', err);
      });
    }

    response.status(status).json({
      data: null,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

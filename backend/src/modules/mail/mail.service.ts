import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { DataSource } from 'typeorm';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER', 'no-reply@hanzi-srs.com'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  private async logSilentError(jobName: string, errorMessage: string) {
    try {
      await this.dataSource.query(
        `INSERT INTO system_job_logs (job_name, status, last_run, error_message, created_at, updated_at) 
         VALUES ($1, 'ERROR', NOW(), $2, NOW(), NOW())`,
        [jobName, errorMessage]
      );
    } catch (e) {
      this.logger.error('Failed to log silent error to system_job_logs', e);
    }
  }

  async sendRegistrationOtp(to: string, otp: string) {
    const mailOptions = {
      from: `"Hanzi SRS" <${this.configService.get<string>('SMTP_FROM', 'no-reply@hanzi-srs.com')}>`,
      to,
      subject: 'Xác thực tài khoản Hanzi SRS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a472a;">Chào mừng đến với Hanzi SRS!</h2>
          <p>Mã xác thực (OTP) của bạn để đăng ký tài khoản là:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #fbfbe9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Gửi OTP thành công đến ${to}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gửi email đến ${to}`, error);
      const msg = error.message?.substring(0, 1000) || 'Unknown SMTP error';
      this.logSilentError('External API - Email Service', msg).catch(() => {});
      // Fallback: log the OTP to console if SMTP is not configured yet
      this.logger.log(`[DEV MODE] OTP cho ${to}: ${otp}`);
      // Không ném lỗi để người dùng có thể test trong log
    }
  }

  async sendForgotPasswordOtp(to: string, otp: string) {
    const mailOptions = {
      from: `"Hanzi SRS" <${this.configService.get<string>('SMTP_FROM', 'no-reply@hanzi-srs.com')}>`,
      to,
      subject: 'Khôi phục mật khẩu Hanzi SRS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a472a;">Yêu cầu khôi phục mật khẩu!</h2>
          <p>Mã xác thực (OTP) để khôi phục mật khẩu của bạn là:</p>
          <div style="font-size: 24px; font-weight: bold; background-color: #fbfbe9; padding: 15px; text-align: center; border-radius: 8px; margin: 20px 0; letter-spacing: 5px;">
            ${otp}
          </div>
          <p>Mã này có hiệu lực trong 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Gửi OTP khôi phục mật khẩu thành công đến ${to}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gửi email khôi phục mật khẩu đến ${to}`, error);
      const msg = error.message?.substring(0, 1000) || 'Unknown SMTP error';
      this.logSilentError('External API - Email Service', msg).catch(() => {});
      // Fallback: log the OTP to console if SMTP is not configured yet
      this.logger.log(`[DEV MODE] OTP khôi phục mật khẩu cho ${to}: ${otp}`);
      // Không ném lỗi để người dùng có thể test trong log
    }
  }
  async sendContactConfirmationEmail(to: string, name: string) {
    const mailOptions = {
      from: `"Hanzi SRS" <${this.configService.get<string>('SMTP_FROM', 'no-reply@hanzi-srs.com')}>`,
      to,
      subject: 'Xác nhận yêu cầu liên hệ - Hanzi SRS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a472a;">Chào ${name},</h2>
          <p>Cảm ơn bạn đã liên hệ với Khu Rừng Xanh (Hanzi SRS). Chúng tôi đã nhận được yêu cầu của bạn và sẽ phản hồi trong thời gian sớm nhất (thường là trong vòng 24 giờ).</p>
          <p>Chúc bạn một ngày tốt lành!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Vui lòng không trả lời trực tiếp email tự động này.</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Gửi email xác nhận liên hệ thành công đến ${to}`);
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email xác nhận liên hệ đến ${to}`, error);
    }
  }

  async sendContactReplyEmail(to: string, name: string, replyMessage: string) {
    const mailOptions = {
      from: `"Hanzi SRS Support" <${this.configService.get<string>('SMTP_FROM', 'no-reply@hanzi-srs.com')}>`,
      to,
      subject: 'Phản hồi liên hệ từ Hanzi SRS',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #1a472a;">Chào ${name},</h2>
          <p>Cảm ơn bạn đã chờ đợi. Dưới đây là phản hồi từ đội ngũ hỗ trợ của chúng tôi:</p>
          <div style="background-color: #fbfbe9; border-left: 4px solid #1a472a; padding: 15px; margin: 20px 0; white-space: pre-wrap;">${replyMessage}</div>
          <p>Nếu bạn cần hỗ trợ thêm, vui lòng tạo một yêu cầu liên hệ mới trên website.</p>
          <p>Trân trọng,<br/>Đội ngũ Hanzi SRS</p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Gửi email phản hồi liên hệ thành công đến ${to}`);
    } catch (error: any) {
      this.logger.error(`Lỗi khi gửi email phản hồi liên hệ đến ${to}`, error);
      const msg = error.message?.substring(0, 1000) || 'Unknown SMTP error';
      this.logSilentError('External API - Email Service', msg).catch(() => {});
      this.logger.log(`[DEV MODE] Phản hồi liên hệ cho ${to}: ${replyMessage}`);
    }
  }
}

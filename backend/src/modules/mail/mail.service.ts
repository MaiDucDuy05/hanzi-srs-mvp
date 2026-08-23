import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: this.configService.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendRegistrationOtp(to: string, otp: string) {
    const mailOptions = {
      from: `"Hanzi SRS" <${this.configService.get<string>('SMTP_USER')}>`,
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
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email đến ${to}`, error);
      // Fallback: log the OTP to console if SMTP is not configured yet
      this.logger.log(`[DEV MODE] OTP cho ${to}: ${otp}`);
      // Không ném lỗi để người dùng có thể test trong log
    }
  }

  async sendForgotPasswordOtp(to: string, otp: string) {
    const mailOptions = {
      from: `"Hanzi SRS" <${this.configService.get<string>('SMTP_USER')}>`,
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
    } catch (error) {
      this.logger.error(`Lỗi khi gửi email khôi phục mật khẩu đến ${to}`, error);
      // Fallback: log the OTP to console if SMTP is not configured yet
      this.logger.log(`[DEV MODE] OTP Khôi phục mật khẩu cho ${to}: ${otp}`);
    }
  }
}

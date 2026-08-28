import {
  Controller,
  Post,
  Patch,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RegisterDto, LoginDto, UpdateMeDto, ChangePasswordDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';

export const ACCESS_TOKEN_COOKIE = 'access_token';
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày — khớp expiresIn JWT

/**
 * Auth qua HttpOnly cookie (TỐI ƯU): FE không đọc/touch token, browser tự gửi
 * mỗi request. Body response không còn accessToken (tránh XSS đánh cắp).
 */
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @Post('register/request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async requestRegisterOtp(@Body() dto: RegisterDto) {
    await this.authService.requestRegisterOtp(dto);
    return {
      data: null,
      message: 'OTP has been sent to your email',
    };
  }

  @Public()
  @Post('register/verify-otp')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async verifyRegisterOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user, exp } = await this.authService.verifyRegisterOtp(email, otp);
    this.setAccessTokenCookie(res, accessToken, user.role);
    return {
      data: { user: this.authService.sanitizeUser(user), exp },
      message: 'Registered successfully',
    };
  }

  @Public()
  @Post('forgot-password/request-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async requestForgotPasswordOtp(@Body('email') email: string) {
    await this.authService.requestForgotPasswordOtp(email);
    return {
      data: null,
      message: 'OTP has been sent to your email',
    };
  }

  @Public()
  @Post('forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async verifyForgotPasswordOtp(
    @Body('email') email: string,
    @Body('otp') otp: string,
  ) {
    await this.authService.verifyForgotPasswordOtp(email, otp);
    return {
      data: null,
      message: 'OTP is valid',
    };
  }

  @Public()
  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async resetPassword(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user, exp } = await this.authService.resetPassword(email, otp, newPassword);
    this.setAccessTokenCookie(res, accessToken, user.role);
    return {
      data: { user: this.authService.sanitizeUser(user), exp },
      message: 'Password reset successfully',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 1000, ttl: 60000 } }) // Tăng lên 1000 để test Spike 500 users
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user, exp } = await this.authService.login(dto);
    this.setAccessTokenCookie(res, accessToken, user.role);
    return {
      data: { user: this.authService.sanitizeUser(user), exp },
      message: 'Logged in successfully',
    };
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.cookieOptions());
    return { data: null, message: 'Logged out successfully' };
  }

  @Get('me')
  async me(@CurrentUser() current: JwtPayload) {
    const user = await this.userService.findById(current.sub);
    return {
      data: { user: this.authService.sanitizeUser(user), exp: current.exp },
      message: 'Profile retrieved successfully',
    };
  }

  /** Student tự cập nhật profile của mình (fullName, dailyGoal). */
  @Patch('me')
  async updateMe(@CurrentUser() current: JwtPayload, @Body() dto: UpdateMeDto) {
    const user = await this.authService.updateMe(current.sub, dto);
    return {
      data: this.authService.sanitizeUser(user),
      message: 'Profile updated successfully',
    };
  }

  @Patch('change-password')
  async changePassword(@CurrentUser() current: JwtPayload, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(current.sub, dto);
    return {
      data: null,
      message: 'Password changed successfully',
    };
  }

  private setAccessTokenCookie(res: Response, token: string, role: string) {
    res.cookie(ACCESS_TOKEN_COOKIE, token, this.cookieOptions(role));
  }

  private cookieOptions(role?: string) {
    const maxAge = role === 'ADMIN' 
      ? 24 * 60 * 60 * 1000       // 1 ngày
      : 7 * 24 * 60 * 60 * 1000;  // 7 ngày

    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      maxAge,
      path: '/',
    };
  }
}

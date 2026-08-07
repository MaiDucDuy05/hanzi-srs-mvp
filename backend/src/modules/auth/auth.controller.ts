import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
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
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.register(dto);
    this.setAccessTokenCookie(res, accessToken);
    return {
      data: { user: this.authService.sanitizeUser(user) },
      message: 'Registered successfully',
    };
  }

  @Public()
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, user } = await this.authService.login(dto);
    this.setAccessTokenCookie(res, accessToken);
    return {
      data: { user: this.authService.sanitizeUser(user) },
      message: 'Logged in successfully',
    };
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.cookieOptions());
    return { data: null, message: 'Logged out successfully' };
  }

  /** Profile hiện tại theo cookie — thay cho user lưu localStorage ở FE. */
  @Get('me')
  async me(@CurrentUser() current: JwtPayload) {
    const user = await this.userService.findById(current.sub);
    return {
      data: this.authService.sanitizeUser(user),
      message: 'Profile retrieved successfully',
    };
  }

  private setAccessTokenCookie(res: Response, token: string) {
    res.cookie(ACCESS_TOKEN_COOKIE, token, this.cookieOptions());
  }

  private cookieOptions() {
    return {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax' as const,
      maxAge: MAX_AGE_MS,
      path: '/',
    };
  }
}

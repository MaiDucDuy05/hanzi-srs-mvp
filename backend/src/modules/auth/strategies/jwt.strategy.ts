import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { UserService } from '../user.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    const nodeEnv = configService.get<string>('NODE_ENV');

    if (!secret) {
      if (nodeEnv === 'production') {
        throw new InternalServerErrorException('JWT_SECRET is required in production');
      }
      throw new InternalServerErrorException('JWT_SECRET must be set');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    try {
      const user = await this.userService.findById(payload.sub);
      if (user.status === 'BANNED') {
        throw new UnauthorizedException(`Tài khoản đã bị khóa. Lý do: ${user.banReason || 'Không xác định'}. Liên hệ admin.`);
      }
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Token không hợp lệ hoặc người dùng không tồn tại');
    }
    
    return { sub: payload.sub, email: payload.email, role: payload.role, exp: payload.exp };
  }
}

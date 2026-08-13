import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private redisService: RedisService,
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
    const isBanned = await this.redisService.getClient().get(`banned:${payload.sub}`);
    if (isBanned) {
      throw new UnauthorizedException(`Tài khoản đã bị khóa. Lý do: ${isBanned}. Liên hệ admin.`);
    }
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}

import { Module, InternalServerErrorException } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret && configService.get<string>('NODE_ENV') === 'production') {
          throw new InternalServerErrorException('JWT_SECRET is required in production');
        }
        return {
          secret: secret || 'dev-secret',
          signOptions: { expiresIn: '7d' },
        };
      },
    }),
  ],
  controllers: [AuthController, UserController],
  providers: [AuthService, UserService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, AuthService, UserService],
})
export class AuthModule {}

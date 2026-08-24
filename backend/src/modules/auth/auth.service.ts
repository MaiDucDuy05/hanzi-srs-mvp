import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto, UpdateMeDto } from './dto/auth.dto';
import { Role, UserStatus } from '../../common/enums/user.enums';
import { Subscription } from '../subscription/entities/subscription.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private mailService: MailService,
  ) {}

  async requestRegisterOtp(dto: RegisterDto): Promise<void> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache-manager v5: TTL is in milliseconds
    await this.cacheManager.set(`register_otp:${dto.email}`, { ...dto, passwordHash, otp }, 300000);

    await this.mailService.sendRegistrationOtp(dto.email, otp);
  }

  async verifyRegisterOtp(email: string, otp: string): Promise<{ accessToken: string; user: User; exp: number }> {
    const cachedData = await this.cacheManager.get<any>(`register_otp:${email}`);
    if (!cachedData || cachedData.otp !== otp) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      await this.cacheManager.del(`register_otp:${email}`);
      throw new ConflictException('Email already exists');
    }

    const user = this.userRepo.create({ 
      email: cachedData.email, 
      fullName: cachedData.fullName, 
      passwordHash: cachedData.passwordHash, 
      role: Role.FREE 
    });
    const saved = await this.userRepo.save(user);

    await this.cacheManager.del(`register_otp:${email}`);

    const payload = { sub: saved.id, email: saved.email, role: saved.role };
    const expiresIn = saved.role === Role.ADMIN ? '1d' : '7d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(accessToken) as any;

    return { accessToken, user: saved, exp: decoded.exp };
  }

  async requestForgotPasswordOtp(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Không tìm thấy tài khoản với email này.');

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Cache-manager v5: TTL is in milliseconds (5 minutes = 300000ms)
    await this.cacheManager.set(`forgot_pwd_otp:${email}`, { otp }, 300000);

    await this.mailService.sendForgotPasswordOtp(email, otp);
  }

  async verifyForgotPasswordOtp(email: string, otp: string): Promise<void> {
    const cachedData = await this.cacheManager.get<any>(`forgot_pwd_otp:${email}`);
    if (!cachedData || cachedData.otp !== otp) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }
    // Note: We don't delete the OTP here so it can be used in the reset step.
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ accessToken: string; user: User; exp: number }> {
    const cachedData = await this.cacheManager.get<any>(`forgot_pwd_otp:${email}`);
    if (!cachedData || cachedData.otp !== otp) {
      throw new BadRequestException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
    }

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Không tìm thấy tài khoản.');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.save(user);

    await this.cacheManager.del(`forgot_pwd_otp:${email}`);

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = user.role === Role.ADMIN ? '1d' : '7d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(accessToken) as any;

    return { accessToken, user, exp: decoded.exp };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: User; exp: number }> {
    const user = await this.userRepo.createQueryBuilder('user')
      .where('user.email = :email', { email: dto.email })
      .addSelect('user.passwordHash')
      .getOne();
    if (!user) throw new UnauthorizedException('Invalid email or password');

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account has been suspended');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    // Fetch VIP subscription to populate vipValidUntil
    const sub = await this.subRepo.findOne({
      where: { userId: user.id, status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlan.VIP },
      order: { expiresAt: 'DESC' }
    });
    Object.assign(user, { vipValidUntil: sub?.expiresAt || null });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const expiresIn = user.role === Role.ADMIN ? '1d' : '7d';
    const accessToken = this.jwtService.sign(payload, { expiresIn });
    const decoded = this.jwtService.decode(accessToken) as any;

    return { accessToken, user, exp: decoded.exp };
  }

  /** Bỏ passwordHash trước khi trả về client (dùng cho login/register/me). */
  sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { fullName, dailyGoal } = dto;
    if (fullName !== undefined) user.fullName = fullName;
    if (dailyGoal !== undefined) user.dailyGoal = dailyGoal;
    return this.userRepo.save(user);
  }
}

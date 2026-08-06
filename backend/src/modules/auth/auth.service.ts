import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Role } from '../../common/enums/user.enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.userRepo.create({ ...dto, passwordHash, role: Role.FREE });
    const saved = await this.userRepo.save(user);

    const payload = { sub: saved.id, email: saved.email, role: saved.role };
    const { passwordHash: _, ...safeUser } = saved;
    return { accessToken: this.jwtService.sign(payload), user: safeUser };
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: Partial<User> }> {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid email or password');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid email or password');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const { passwordHash: _, ...safeUser } = user;
    return { accessToken: this.jwtService.sign(payload), user: safeUser };
  }

  async validateUser(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }
}

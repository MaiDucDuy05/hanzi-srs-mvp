import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/auth.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/pagination.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAll(query: UserQueryDto): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC', role, status, search } = query;
    const where: Record<string, unknown> = {};

    if (role) where.role = role;
    if (status) where.status = status;

    const [data, total] = await this.userRepo.findAndCount({
      where: search
        ? [
            { ...where, email: ILike(`%${search}%`) },
            { ...where, fullName: ILike(`%${search}%`) },
          ]
        : where,
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.userRepo.save(
      this.userRepo.create({ ...dto, passwordHash }),
    );
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepo.findOne({ where: { email: dto.email } });
      if (existing) throw new ConflictException('Email already exists');
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
    const { password, ...rest } = dto;
    Object.assign(user, rest, passwordHash ? { passwordHash } : {});
    return this.userRepo.save(user);
  }

  async softDelete(id: string): Promise<void> {
    const user = await this.findById(id);
    await this.userRepo.softRemove(user);
  }

  async restore(id: string): Promise<User> {
    await this.userRepo.recover({ id } as User);
    return this.findById(id);
  }
}

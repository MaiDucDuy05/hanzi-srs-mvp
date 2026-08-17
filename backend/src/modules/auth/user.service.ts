import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';
import { CreateUserDto, UpdateUserDto } from './dto/auth.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { PaginatedResult } from '../../common/pagination.dto';
import { TestAttempt } from '../test/entities/test-attempt.entity';
import { UserVocabularyProgress } from '../srs/entities/user-vocabulary-progress.entity';
import { UserActivity } from '../achievements/entities/user-activity.entity';
import { TestAttemptStatus } from '../../common/enums/test.enums';
import { Role } from '../../common/enums/user.enums';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Subscription)
    private subRepo: Repository<Subscription>,
    @InjectRepository(TestAttempt)
    private testAttemptRepo: Repository<TestAttempt>,
    @InjectRepository(UserVocabularyProgress)
    private vocabProgressRepo: Repository<UserVocabularyProgress>,
    @InjectRepository(UserActivity)
    private activityRepo: Repository<UserActivity>,
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

  async getStudentsStats(query: UserQueryDto): Promise<any> {
    const { page = 1, limit = 20 } = query;
    const [students, total] = await this.userRepo.findAndCount({
      where: { role: Role.FREE },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    if (students.length === 0) {
      return { data: [], meta: { page, limit, total, totalPages: 0 } };
    }

    const userIds = students.map((s) => s.id);

    // Compute Test Avg
    const tests = await this.testAttemptRepo.createQueryBuilder('attempt')
      .select('attempt.userId', 'userId')
      .addSelect('AVG(attempt.score)', 'avgScore')
      .where('attempt.userId IN (:...userIds)', { userIds })
      .andWhere('attempt.status IN (:...statuses)', { 
        statuses: [TestAttemptStatus.GRADED, TestAttemptStatus.SUBMITTED] 
      })
      .groupBy('attempt.userId')
      .getRawMany();

    const testMap = new Map<string, number>();
    tests.forEach((t) => {
      const avg = Math.round(parseFloat(t.avgScore) || 0);
      testMap.set(t.userId, avg);
    });

    // Compute Vocab Mastery
    const vocab = await this.vocabProgressRepo.createQueryBuilder('vp')
      .select('vp.userId', 'userId')
      .addSelect('COUNT(vp.id)', 'totalVocab')
      .addSelect('SUM(CASE WHEN vp.masteryLevel >= 3 THEN 1 ELSE 0 END)', 'masteredVocab')
      .where('vp.userId IN (:...userIds)', { userIds })
      .groupBy('vp.userId')
      .getRawMany();

    const vocabMap = new Map<string, number>();
    vocab.forEach((v) => {
      const total = parseInt(v.totalVocab, 10) || 0;
      const mastered = parseInt(v.masteredVocab, 10) || 0;
      vocabMap.set(v.userId, total > 0 ? Math.round((mastered / total) * 100) : 0);
    });

    const data = students.map((s) => {
      // Mock course progress based on totalExp (1000 exp = 100%)
      const courseProgress = Math.min(100, Math.round(((s.totalExp || 0) / 1000) * 100));
      return {
        id: s.id,
        email: s.email,
        fullName: s.fullName,
        role: s.role,
        courseProgress,
        testAvg: testMap.get(s.id) || 0,
        vocabMastery: vocabMap.get(s.id) || 0,
      };
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStudentsActivities(limit = 10): Promise<any[]> {
    const students = await this.userRepo.find({
      where: { role: Role.FREE },
      select: ['id', 'fullName'],
    });
    
    if (students.length === 0) return [];
    
    const userIds = students.map(s => s.id);
    const userMap = new Map(students.map(s => [s.id, s]));

    const activities = await this.activityRepo.createQueryBuilder('activity')
      .where('activity.userId IN (:...userIds)', { userIds })
      .orderBy('activity.createdAt', 'DESC')
      .limit(limit)
      .getMany();

    return activities.map(act => ({
      ...act,
      user: userMap.get(act.userId),
    }));
  }

  async findById(id: string): Promise<User & { vipValidUntil?: string | Date | null }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    
    // Fetch VIP subscription to populate vipValidUntil
    const sub = await this.subRepo.findOne({
      where: { userId: id, status: SubscriptionStatus.ACTIVE, plan: SubscriptionPlan.VIP },
      order: { expiresAt: 'DESC' }
    });

    return Object.assign(user, { vipValidUntil: sub?.expiresAt || null });
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const saved = await this.userRepo.save(
      this.userRepo.create({ ...dto, passwordHash }),
    );
    const { passwordHash: _, ...safeUser } = saved;
    return safeUser as User;
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
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...safeUser } = saved;
    return safeUser as User;
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

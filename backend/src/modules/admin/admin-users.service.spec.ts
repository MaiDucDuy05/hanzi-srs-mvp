import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AdminUsersService } from './admin-users.service';
import { User } from '../auth/entities/user.entity';
import { Subscription } from '../subscription/entities/subscription.entity';
import { AuditLogService } from './audit-log.service';
import { Role, UserStatus } from '../../common/enums/user.enums';

jest.mock('bcrypt');

describe('AdminUsersService', () => {
  let service: AdminUsersService;
  let userRepo: any;
  let subRepo: any;
  let auditLogService: { logAction: jest.Mock };

  beforeEach(async () => {
    userRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
      create: jest.fn((x) => x),
    };
    subRepo = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((x) => x),
    };
    auditLogService = { logAction: jest.fn().mockResolvedValue(undefined) };

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminUsersService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: AuditLogService, useValue: auditLogService },
      ],
    }).compile();

    service = module.get<AdminUsersService>(AdminUsersService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    function buildQbMock(data: any[] = [], total = 0) {
      const qb: any = {
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([data, total]),
      };
      return qb;
    }

    function buildSubQbMock(subs: Subscription[] = []) {
      const qb: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(subs),
      };
      return qb;
    }

    it('returns paginated users with vipValidUntil', async () => {
      const users = [
        { id: 'u1', email: 'a@b.com', fullName: 'A', createdAt: new Date() } as User,
      ];
      userRepo.createQueryBuilder.mockReturnValue(buildQbMock(users, 1));
      subRepo.createQueryBuilder.mockReturnValue(buildSubQbMock([
        { userId: 'u1', expiresAt: new Date('2026-12-31') } as Subscription,
      ]));

      const result = await service.findAll({ page: '1', limit: '20' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].vipValidUntil).toEqual(new Date('2026-12-31'));
      expect(result.data[0].passwordHash).toBeUndefined();
    });

    it('filters by role and status', async () => {
      const qb = buildQbMock();
      userRepo.createQueryBuilder.mockReturnValue(qb);
      subRepo.createQueryBuilder.mockReturnValue(buildSubQbMock());

      await service.findAll({ role: 'ADMIN', status: 'ACTIVE' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.role = :role',
        { role: 'ADMIN' },
      );
      expect(qb.andWhere).toHaveBeenCalledWith(
        'user.status = :status',
        { status: 'ACTIVE' },
      );
    });

    it('filters by search term (ILIKE on email and fullName)', async () => {
      const qb = buildQbMock();
      userRepo.createQueryBuilder.mockReturnValue(qb);
      subRepo.createQueryBuilder.mockReturnValue(buildSubQbMock());

      await service.findAll({ search: 'foo' });

      expect(qb.andWhere).toHaveBeenCalledWith(
        '(user.email ILIKE :search OR user.fullName ILIKE :search)',
        { search: '%foo%' },
      );
    });

    it('VIP plan filter joins Subscription', async () => {
      const qb = buildQbMock();
      userRepo.createQueryBuilder.mockReturnValue(qb);
      subRepo.createQueryBuilder.mockReturnValue(buildQbMock());

      await service.findAll({ plan: 'VIP' });

      expect(qb.innerJoin).toHaveBeenCalled();
    });

    it('FREE plan filter excludes VIP users', async () => {
      const qb = buildQbMock();
      userRepo.createQueryBuilder.mockReturnValue(qb);
      subRepo.createQueryBuilder.mockReturnValue(buildQbMock());

      await service.findAll({ plan: 'FREE' });

      expect(qb.leftJoin).toHaveBeenCalled();
      expect(qb.andWhere).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('throws NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('u-x')).rejects.toThrow(NotFoundException);
    });

    it('returns user with vipValidUntil when sub exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u1' } as User);
      subRepo.findOne.mockResolvedValue({ expiresAt: new Date('2026-12-31') } as Subscription);

      const result = await service.findById('u1');

      expect((result as any).vipValidUntil).toEqual(new Date('2026-12-31'));
      expect((result as any).passwordHash).toBeUndefined();
    });
  });

  describe('createUser', () => {
    it('throws ConflictException when email exists', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'u-existing' } as User);

      await expect(
        service.createUser({ email: 'a@b.com', fullName: 'A', role: 'FREE' }, 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user with default password and writes audit log', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      // save() should mutate newUser to assign id (mimicking real repo)
      userRepo.save.mockImplementation((u: any) => {
        u.id = 'new-id';
        return Promise.resolve(u);
      });
      userRepo.findOne.mockResolvedValueOnce({ id: 'new-id' } as User);

      await service.createUser({ email: 'a@b.com', fullName: 'A', role: 'FREE' }, 'admin-1', '127.0.0.1');

      expect(bcrypt.hash).toHaveBeenCalledWith('Hanzi@123456', 10);
      expect(userRepo.save).toHaveBeenCalled();
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'admin-1', 'CREATE_USER', 'USER', 'new-id', '127.0.0.1',
        expect.objectContaining({ newValue: expect.any(Object) }),
      );
    });

    it('creates VIP subscription when role=VIP and vipDays provided', async () => {
      userRepo.findOne.mockResolvedValueOnce(null);
      userRepo.save.mockResolvedValue({ id: 'vip-id', email: 'v@b.com', role: Role.FREE });
      userRepo.findOne.mockResolvedValueOnce({ id: 'vip-id' } as User);
      subRepo.save.mockResolvedValue({});

      await service.createUser({ email: 'v@b.com', fullName: 'V', role: 'VIP', vipDays: 30 }, 'admin-1', '127.0.0.1');

      expect(subRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'VIP', status: 'ACTIVE' }),
      );
      expect(subRepo.save).toHaveBeenCalled();
    });
  });

  describe('changeRole', () => {
    it('throws NotFoundException when target not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.changeRole('u-x', 'FREE', undefined, 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when admin demotes themselves', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'admin-1', role: Role.ADMIN } as User);

      await expect(
        service.changeRole('admin-1', 'FREE', undefined, 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws LAST_ADMIN_PROTECTED when last admin tries to be demoted', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'other-admin', role: Role.ADMIN } as User);
      userRepo.count.mockResolvedValue(1);

      await expect(
        service.changeRole('other-admin', 'FREE', undefined, 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(/LAST_ADMIN_PROTECTED/);
    });

    it('upgrades user to VIP and creates subscription when no existing sub', async () => {
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1', role: Role.FREE } as User);
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1' } as User); // findById at end
      subRepo.findOne.mockResolvedValue(null);
      subRepo.save.mockResolvedValue({});

      await service.changeRole('u1', 'VIP', 30, 'admin-1', '127.0.0.1');

      expect(subRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ plan: 'VIP' }),
      );
    });

    it('extends existing VIP subscription when upgrading', async () => {
      const futureDate = new Date(Date.now() + 10 * 86_400_000);
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1', role: Role.FREE } as User);
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1' } as User);
      subRepo.findOne.mockResolvedValue({ id: 'sub-1', expiresAt: futureDate, status: 'ACTIVE', plan: 'VIP' } as Subscription);
      subRepo.save.mockResolvedValue({});

      await service.changeRole('u1', 'VIP', 30, 'admin-1', '127.0.0.1');

      expect(subRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ expiresAt: expect.any(Date) }),
      );
    });

    it('expires existing VIP subscription when changing to non-VIP role', async () => {
      const existingSub = { id: 'sub-1', expiresAt: new Date(), status: 'ACTIVE', plan: 'VIP' } as Subscription;
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1', role: Role.VIP as any } as User);
      userRepo.findOne.mockResolvedValueOnce({ id: 'u1' } as User);
      subRepo.findOne.mockResolvedValue(existingSub);

      await service.changeRole('u1', 'FREE', undefined, 'admin-1', '127.0.0.1');

      expect(existingSub.status).toBe('EXPIRED');
    });
  });

  describe('banUser', () => {
    it('throws ForbiddenException when admin bans themselves', async () => {
      await expect(
        service.banUser('admin-1', 'reason', 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(/CANNOT_BAN_SELF/);
    });

    it('throws NotFoundException when target not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(
        service.banUser('u-x', 'reason', 'admin-1', '127.0.0.1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws LAST_ADMIN_PROTECTED when last admin tries to be banned', async () => {
      userRepo.findOne.mockResolvedValue({ id: 'a1', role: Role.ADMIN } as User);
      userRepo.count.mockResolvedValue(1);

      await expect(
        service.banUser('a1', 'reason', 'admin-2', '127.0.0.1'),
      ).rejects.toThrow(/LAST_ADMIN_PROTECTED/);
    });

    it('bans user and writes audit log', async () => {
      const user = { id: 'u1', role: Role.FREE, status: UserStatus.ACTIVE } as User;
      userRepo.findOne.mockResolvedValue(user);

      await service.banUser('u1', 'spam', 'admin-1', '127.0.0.1');

      expect(user.status).toBe(UserStatus.BANNED);
      expect(user.banReason).toBe('spam');
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'admin-1', 'BAN_USER', 'USER', 'u1', '127.0.0.1',
        expect.objectContaining({ reason: 'spam' }),
      );
    });
  });

  describe('unbanUser', () => {
    it('resets user status and writes audit log', async () => {
      const user = {
        id: 'u1', status: UserStatus.BANNED, banReason: 'x',
        bannedAt: new Date(), bannedBy: 'admin-1',
      } as User;
      userRepo.findOne.mockResolvedValue(user);

      const result = await service.unbanUser('u1', 'admin-1', '127.0.0.1');

      expect(user.status).toBe(UserStatus.ACTIVE);
      expect(user.banReason).toBeNull();
      expect(user.bannedAt).toBeNull();
      expect(auditLogService.logAction).toHaveBeenCalledWith(
        'admin-1', 'UNBAN_USER', 'USER', 'u1', '127.0.0.1',
        expect.any(Object),
      );
      expect(result).toEqual(user);
    });

    it('throws NotFoundException when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.unbanUser('u-x', 'admin-1', '127.0.0.1')).rejects.toThrow(NotFoundException);
    });
  });
});
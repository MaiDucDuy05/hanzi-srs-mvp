import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminSubscriptionService } from './admin-subscription.service';
import { Subscription } from './entities/subscription.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { AuditLogService } from '../admin/audit-log.service';

describe('AdminSubscriptionService', () => {
  let service: AdminSubscriptionService;
  const subRepo = {
    count: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((x: any) => x),
    save: jest.fn((x: any) => {
      if (Array.isArray(x)) {
        return Promise.resolve(x.map((s) => ({ ...s, id: s.id ?? `s-${Math.random()}` })));
      }
      x.id = x.id ?? `s-${Math.random()}`;
      return Promise.resolve(x);
    }),
  };
  const reqRepo = {
    count: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn((x: any) => {
      if (Array.isArray(x)) {
        return Promise.resolve(x.map((s) => ({ ...s, id: s.id ?? `r-${Math.random()}` })));
      }
      x.id = x.id ?? `r-${Math.random()}`;
      return Promise.resolve(x);
    }),
  };
  const userRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
  };
  const auditLog = { logAction: jest.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    const mod: TestingModule = await Test.createTestingModule({
      providers: [
        AdminSubscriptionService,
        { provide: getRepositoryToken(Subscription), useValue: subRepo },
        { provide: getRepositoryToken(VipUpgradeRequest), useValue: reqRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: AuditLogService, useValue: auditLog },
      ],
    }).compile();
    service = mod.get(AdminSubscriptionService);
    jest.resetAllMocks();
    subRepo.create.mockImplementation((x: any) => x);
    subRepo.save.mockImplementation((x: any) => {
      if (Array.isArray(x)) {
        return Promise.resolve(x.map((s) => ({ ...s, id: s.id ?? `s-${Math.random()}` })));
      }
      x.id = x.id ?? `s-${Math.random()}`;
      return Promise.resolve(x);
    });
    reqRepo.save.mockImplementation((x: any) => {
      if (Array.isArray(x)) {
        return Promise.resolve(x.map((s) => ({ ...s, id: s.id ?? `r-${Math.random()}` })));
      }
      x.id = x.id ?? `r-${Math.random()}`;
      return Promise.resolve(x);
    });
    auditLog.logAction.mockResolvedValue(undefined);
  });

  it('getStats aggregates VIP, pending and monthly revenue', async () => {
    subRepo.count.mockResolvedValueOnce(12);
    reqRepo.count.mockResolvedValueOnce(3);
    reqRepo.find.mockResolvedValueOnce([
      { amount: 9.99 },
      { amount: 99.00 },
    ]);
    subRepo.find.mockResolvedValueOnce([]);
    const out = await service.getStats();
    expect(out.totalVipUsers).toBe(12);
    expect(out.pendingRequests).toBe(3);
    expect(out.monthlyRevenue).toBeCloseTo(108.99);
    expect(out.expiringSoon).toEqual([]);
  });

  it('getStats attaches user info to expiringSoon list', async () => {
    subRepo.count.mockResolvedValueOnce(1);
    reqRepo.count.mockResolvedValueOnce(0);
    reqRepo.find.mockResolvedValueOnce([]);
    subRepo.find.mockResolvedValueOnce([
      { userId: 'u1', expiresAt: new Date() },
    ]);
    userRepo.find.mockResolvedValueOnce([
      { id: 'u1', email: 'a@b.c', fullName: 'A' },
    ]);
    const out = await service.getStats();
    expect(out.expiringSoon).toHaveLength(1);
    expect(out.expiringSoon[0]).toMatchObject({
      user_id: 'u1',
      name: 'A',
    });
  });

  it('getRequests decorates each row with userEmail and userName', async () => {
    reqRepo.findAndCount.mockResolvedValueOnce([[{ id: 'r1', userId: 'u1' }], 1]);
    userRepo.find.mockResolvedValueOnce([
      { id: 'u1', email: 'a@b.c', fullName: 'Alice' },
    ]);
    const res = await service.getRequests({} as any);
    const row: any = (res.data[0] as any);
    expect(row.userEmail).toBe('a@b.c');
    expect(row.userName).toBe('Alice');
  });

  it('approveRequest creates new sub and audit-logs APPROVE_VIP_REQUEST', async () => {
    reqRepo.findOne
      .mockResolvedValueOnce({ id: 'r1', userId: 'u1', status: 'PENDING', plan: 'ONE_MONTH' })
      .mockResolvedValueOnce({ id: 'u1', email: 'a@b.c', fullName: 'A' });
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c', fullName: 'A' });
    subRepo.findOne.mockResolvedValueOnce(null);
    await service.approveRequest('r1', 'admin-1');
    expect(subRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE', userId: 'u1' }),
    );
    expect(auditLog.logAction).toHaveBeenCalledWith(
      'admin-1', 'APPROVE_VIP_REQUEST', 'Subscription', expect.any(String), 'system',
      expect.objectContaining({ newValue: expect.any(Object) }),
    );
  });

  it('approveRequest rejects when request is not pending', async () => {
    reqRepo.findOne.mockResolvedValueOnce({ id: 'r1', status: 'APPROVED' });
    await expect(service.approveRequest('r1', 'admin-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('approveRequest extends existing active sub', async () => {
    const future = new Date();
    future.setMonth(future.getMonth() + 6);
    reqRepo.findOne
      .mockResolvedValueOnce({ id: 'r1', userId: 'u1', status: 'PENDING', plan: 'SIX_MONTHS' })
      .mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    subRepo.findOne.mockResolvedValueOnce({ id: 's1', expiresAt: future, status: 'ACTIVE' });
    await service.approveRequest('r1', 'admin-1');
    expect(subRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' }),
    );
  });

  it('rejectRequest sets status and writes audit log', async () => {
    reqRepo.findOne
      .mockResolvedValueOnce({ id: 'r1', userId: 'u1', status: 'PENDING' })
      .mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    await service.rejectRequest('r1', 'admin-1', 'invalid');
    expect(reqRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REJECTED', note: 'invalid' }),
    );
    expect(auditLog.logAction).toHaveBeenCalledWith(
      'admin-1', 'REJECT_VIP_REQUEST', 'VipUpgradeRequest', 'r1', 'system',
      expect.objectContaining({ newValue: { status: 'REJECTED' } }),
    );
  });

  it('rejectRequest rejects when not pending', async () => {
    reqRepo.findOne.mockResolvedValueOnce({ id: 'r1', status: 'APPROVED' });
    await expect(service.rejectRequest('r1', 'admin-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('extendSubscription throws when user has no VIP sub', async () => {
    subRepo.findOne.mockResolvedValueOnce(null);
    await expect(service.extendSubscription('u1', 'admin-1', 7)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('extendSubscription adds days and audit-logs', async () => {
    subRepo.findOne.mockResolvedValueOnce({ id: 's1', expiresAt: new Date() });
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    await service.extendSubscription('u1', 'admin-1', 14, 'bonus');
    expect(subRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' }),
    );
    expect(auditLog.logAction).toHaveBeenCalledWith(
      'admin-1', 'EXTEND_VIP', 'Subscription', 's1', 'system',
      expect.objectContaining({ reason: 'bonus' }),
    );
  });

  it('cancelSubscription marks sub EXPIRED when found', async () => {
    subRepo.findOne.mockResolvedValueOnce({ id: 's1', userId: 'u1', status: 'ACTIVE' });
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    await service.cancelSubscription('u1', 'admin-1', 'oops');
    expect(subRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'EXPIRED' }),
    );
  });

  it('cancelSubscription is a no-op when no sub exists', async () => {
    subRepo.findOne.mockResolvedValueOnce(null);
    userRepo.findOne.mockResolvedValueOnce({ id: 'u1', email: 'a@b.c' });
    await service.cancelSubscription('u1', 'admin-1');
    expect(subRepo.save).not.toHaveBeenCalled();
  });
});

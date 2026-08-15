import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In } from 'typeorm';
import { Subscription } from './entities/subscription.entity';
import { VipUpgradeRequest } from './entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { AuditLogService } from '../admin/audit-log.service';
import { Role } from '../../common/enums/user.enums';
import { SubscriptionStatus, SubscriptionPlan, UpgradeRequestStatus, VipPackagePlan } from '../../common/enums/subscription.enums';
import { paginatedResult, findOrNotFound } from '../../common/helpers/query-helpers';

@Injectable()
export class AdminSubscriptionService {
  constructor(
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(VipUpgradeRequest) private reqRepo: Repository<VipUpgradeRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async getStats() {
    const totalVipUsers = await this.subRepo.count({ 
      where: { plan: SubscriptionPlan.VIP, status: SubscriptionStatus.ACTIVE, expiresAt: MoreThan(new Date()) } 
    });
    const pendingRequests = await this.reqRepo.count({ where: { status: UpgradeRequestStatus.PENDING } });
    
    // Revenue for the current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);

    const requestsThisMonth = await this.reqRepo.find({
      where: {
        status: UpgradeRequestStatus.APPROVED,
        reviewedAt: Between(startOfMonth, endOfMonth)
      }
    });
    const monthlyRevenue = requestsThisMonth.reduce((sum, req) => sum + Number(req.amount || 0), 0);

    // Expiring within 7 days
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const expiringSoonList = await this.subRepo.find({
      where: {
        plan: SubscriptionPlan.VIP,
        status: SubscriptionStatus.ACTIVE,
        expiresAt: Between(new Date(), next7Days)
      }
    });

    const expiringSoon = [];
    if (expiringSoonList.length > 0) {
      const userIds = expiringSoonList.map(s => s.userId);
      const users = await this.userRepo.find({ where: { id: In(userIds) } });
      const userMap = new Map(users.map(u => [u.id, u]));
      for (const sub of expiringSoonList) {
        const u = userMap.get(sub.userId);
        if (u) {
          expiringSoon.push({
            user_id: u.id,
            name: u.fullName,
            expires_at: sub.expiresAt
          });
        }
      }
    }

    return { totalVipUsers, pendingRequests, monthlyRevenue, expiringSoon };
  }

  async getRequests(q: any) {
    const { page = 1, limit = 20, status } = q;

    const where: any = {};
    if (status) where.status = status;
    
    const [data, total] = await this.reqRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { requestedAt: 'DESC' }
    });

    if (data.length > 0) {
      const userIds = data.map(d => d.userId);
      const users = await this.userRepo.find({ where: { id: In(userIds) } });
      const userMap = new Map(users.map(u => [u.id, u]));
      for (const req of data) {
        const u = userMap.get(req.userId);
        (req as any).userEmail = u?.email;
        (req as any).userName = u?.fullName;
      }
    }
    
    return paginatedResult(data, total, page, limit);
  }

  private mockSendEmail(email: string, subject: string, body: string) {
    console.log(`[MOCK EMAIL] To: ${email} | Subject: ${subject}`);
    console.log(`Body: ${body}`);
  }

  private getMonthsFromPlan(plan: VipPackagePlan): number {
    if (plan === VipPackagePlan.ONE_MONTH) return 1;
    if (plan === VipPackagePlan.SIX_MONTHS) return 6;
    if (plan === VipPackagePlan.ONE_YEAR) return 12;
    return 1;
  }

  async approveRequest(id: string, reviewedBy: string) {
    const req = await findOrNotFound(this.reqRepo, id, 'VIP request');
    if (req.status !== UpgradeRequestStatus.PENDING) throw new BadRequestException('Request is not pending');

    const user = await findOrNotFound(this.userRepo, req.userId, 'User');

    // Update request
    req.status = UpgradeRequestStatus.APPROVED;
    req.reviewedBy = reviewedBy;
    req.reviewedAt = new Date();
    await this.reqRepo.save(req);

    // Create or extend subscription
    let sub = await this.subRepo.findOne({ where: { userId: user.id, plan: SubscriptionPlan.VIP } });
    const months = this.getMonthsFromPlan(req.plan);
    if (!sub) {
      sub = this.subRepo.create({
        userId: user.id,
        plan: SubscriptionPlan.VIP,
        status: SubscriptionStatus.ACTIVE,
        startsAt: new Date(),
        expiresAt: new Date(new Date().setMonth(new Date().getMonth() + months))
      });
    } else {
      sub.status = SubscriptionStatus.ACTIVE;
      const currentExpiry = sub.expiresAt && sub.expiresAt > new Date() ? sub.expiresAt : new Date();
      sub.expiresAt = new Date(currentExpiry.setMonth(currentExpiry.getMonth() + months));
    }
    await this.subRepo.save(sub);

    this.mockSendEmail(user.email, 'HanziSRS - Yêu cầu VIP được duyệt', 'Chúc mừng, tài khoản của bạn đã được nâng cấp lên VIP!');
    
    await this.auditLogService.logAction(reviewedBy, 'APPROVE_VIP_REQUEST', 'Subscription', sub.id, 'system', {
      reason: 'Duyệt yêu cầu VIP',
      newValue: { status: sub.status, expiresAt: sub.expiresAt }
    });

    return { message: 'Approved' };
  }

  async rejectRequest(id: string, reviewedBy: string, note?: string | null) {
    const req = await findOrNotFound(this.reqRepo, id, 'VIP request');
    if (req.status !== UpgradeRequestStatus.PENDING) throw new BadRequestException('Request is not pending');
    
    req.status = UpgradeRequestStatus.REJECTED;
    req.reviewedBy = reviewedBy;
    req.reviewedAt = new Date();
    if (note) req.note = note;
    await this.reqRepo.save(req);

    const user = await findOrNotFound(this.userRepo, req.userId, 'User');
    this.mockSendEmail(user.email, 'HanziSRS - Yêu cầu VIP bị từ chối', `Yêu cầu bị từ chối với lý do: ${note || 'Không hợp lệ'}`);
    
    await this.auditLogService.logAction(reviewedBy, 'REJECT_VIP_REQUEST', 'VipUpgradeRequest', req.id, 'system', {
      reason: note || 'Từ chối yêu cầu VIP',
      newValue: { status: req.status }
    });

    return { message: 'Rejected' };
  }

  async extendSubscription(userId: string, adminId: string, days: number, note?: string) {
    const sub = await this.subRepo.findOne({ where: { userId, plan: SubscriptionPlan.VIP } });
    if (!sub) throw new BadRequestException('No VIP subscription found');
    
    const currentExpiry = sub.expiresAt && sub.expiresAt > new Date() ? sub.expiresAt : new Date();
    sub.expiresAt = new Date(currentExpiry.setDate(currentExpiry.getDate() + days));
    sub.status = SubscriptionStatus.ACTIVE;
    await this.subRepo.save(sub);

    const user = await findOrNotFound(this.userRepo, userId, 'User');

    this.mockSendEmail(user.email, 'HanziSRS - Gia hạn VIP', `Gói VIP được gia hạn thêm ${days} ngày. Lý do: ${note || 'Thưởng'}`);
    
    await this.auditLogService.logAction(adminId, 'EXTEND_VIP', 'Subscription', sub.id, 'system', {
      reason: note || 'Gia hạn VIP thủ công',
      newValue: { expiresAt: sub.expiresAt }
    });

    return { message: 'Extended' };
  }

  async cancelSubscription(userId: string, adminId: string, note?: string) {
    const sub = await this.subRepo.findOne({ where: { userId, plan: SubscriptionPlan.VIP } });
    if (sub) {
      sub.status = SubscriptionStatus.EXPIRED;
      await this.subRepo.save(sub);
    }
    
    const user = await findOrNotFound(this.userRepo, userId, 'User');

    this.mockSendEmail(user.email, 'HanziSRS - Hủy gói VIP', `Gói VIP của bạn đã bị hủy. Lý do: ${note || 'Theo yêu cầu'}`);
    
    await this.auditLogService.logAction(adminId, 'CANCEL_VIP', 'Subscription', sub?.id || 'unknown', 'system', {
      reason: note || 'Hủy gói VIP thủ công'
    });

    return { message: 'Cancelled' };
  }
}

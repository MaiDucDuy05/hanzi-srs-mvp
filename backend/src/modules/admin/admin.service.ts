import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, MoreThanOrEqual } from 'typeorm';
import { Subscription } from '../subscription/entities/subscription.entity';
import { VipUpgradeRequest } from '../subscription/entities/vip-upgrade-request.entity';
import { User } from '../auth/entities/user.entity';
import { ContactRequest } from '../resources/entities/contact-request.entity';
import { SystemJobLog } from './entities/system-job-log.entity';
import {
  SubscriptionStatus,
  SubscriptionPlan,
  UpgradeRequestStatus,
} from '../../common/enums/subscription.enums';
import { ContactStatus } from '../../common/enums/resources.enums';
import { UserStatsService } from './services/user-stats.service';
import { RevenueService } from './services/revenue.service';
import { HealthService } from './services/health.service';
import { 
  DashboardSummary, 
  DashboardCharts, 
  DashboardPendingItems, 
  DashboardSystemHealth,
  PendingVipItem,
  ExpiringVipItem,
  PendingContactItem,
  SystemErrorItem,
  ChartDataPoint
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    private userStatsSvc: UserStatsService,
    private revenueSvc: RevenueService,
    private healthSvc: HealthService,
    @InjectRepository(Subscription) private subRepo: Repository<Subscription>,
    @InjectRepository(VipUpgradeRequest) private vipReqRepo: Repository<VipUpgradeRequest>,
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(ContactRequest) private contactRepo: Repository<ContactRequest>,
    @InjectRepository(SystemJobLog) private systemJobRepo: Repository<SystemJobLog>,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const [totalUsers, activeVip] = await this.userStatsSvc.getSummaryStats();
    const todayAttempts = await this.userStatsSvc.getAttemptsStats();
    const monthlyRevenue = await this.revenueSvc.getSummaryRevenue();

    return {
      totalUsers,
      activeVip,
      todayAttempts,
      monthlyRevenue,
    };
  }

  async getCharts(): Promise<DashboardCharts> {
    const registrations = await this.userStatsSvc.getRegistrationsChart(30);
    const attempts = await this.userStatsSvc.getAttemptsChart(30);

    return {
      registrations,
      attempts,
    };
  }

  async getPendingItems(): Promise<DashboardPendingItems> {
    const pendingVip = await this.getPendingVipRequests();
    const expiringVip = await this.getExpiringVip();
    const pendingContacts = await this.getPendingContacts();
    const recentSystemErrors = await this.getRecentSystemErrors();

    return {
      pendingVip,
      expiringVip,
      pendingContacts,
      recentSystemErrors,
    };
  }

  async getSystemHealth(): Promise<DashboardSystemHealth> {
    return this.healthSvc.getSystemHealth();
  }

  private async getPendingVipRequests(): Promise<PendingVipItem[]> {
    const reqs = await this.vipReqRepo.find({
      where: { status: UpgradeRequestStatus.PENDING },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    if (reqs.length === 0) return [];
    const users = await this.userRepo.find({ where: { id: In(reqs.map(r => r.userId)) } });
    const userMap = new Map(users.map(u => [u.id, u.fullName]));

    return reqs.map(r => ({
      id: r.id,
      userFullName: userMap.get(r.userId) ?? 'Unknown',
      plan: r.plan as unknown as SubscriptionPlan,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  private async getExpiringVip(): Promise<ExpiringVipItem[]> {
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    
    const subs = await this.subRepo.find({
      where: { 
        status: SubscriptionStatus.ACTIVE,
        plan: SubscriptionPlan.VIP,
      },
      order: { expiresAt: 'ASC' },
      take: 5,
    });
    
    // Filter out those expiring beyond 7 days in memory (or add condition if needed)
    const expiring = subs.filter(s => s.expiresAt && s.expiresAt <= next7Days);
    if (expiring.length === 0) return [];

    const users = await this.userRepo.find({ where: { id: In(expiring.map(s => s.userId)) } });
    const userMap = new Map(users.map(u => [u.id, u.fullName]));

    return expiring.map(s => ({
      id: s.id,
      userFullName: userMap.get(s.userId) ?? 'Unknown',
      expiresAt: s.expiresAt!.toISOString(),
    }));
  }

  private async getPendingContacts(): Promise<PendingContactItem[]> {
    const contacts = await this.contactRepo.find({
      where: { status: ContactStatus.NEW },
      order: { createdAt: 'DESC' },
      take: 5,
    });

    return contacts.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      subject: c.message ? (c.message.length > 50 ? c.message.substring(0, 50) + '...' : c.message) : '',
      createdAt: c.createdAt.toISOString(),
    }));
  }

  private async getRecentSystemErrors(): Promise<SystemErrorItem[]> {
    const errors = await this.systemJobRepo.find({
      where: { status: 'ERROR' },
      order: { lastRun: 'DESC' },
      take: 5,
    });

    return errors.map(e => ({
      id: e.id,
      jobName: e.jobName,
      errorMessage: e.errorMessage ?? 'Lỗi không xác định',
      createdAt: e.lastRun.toISOString(),
    }));
  }
}

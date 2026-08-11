import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { User } from '../../modules/auth/entities/user.entity';
import { Subscription } from '../../modules/subscription/entities/subscription.entity';
import { Role, UserStatus } from '../../common/enums/user.enums';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';

/**
 * Seed tài khoản (idempotent — kiểm tra theo email):
 *  - 1 admin, 2 giáo viên, 5 học viên (mix FREE/VIP)
 * Password của TẤT CẢ account: "Test@1234"
 */
const DEFAULT_PWD = bcrypt.hashSync('Test@1234', 10);

type UserSeed = { email: string; fullName: string; role: Role; vipUntil?: Date };

const USERS: UserSeed[] = [
  { email: 'admin@hanzi.dev',  fullName: 'Admin Hán Tự',     role: Role.ADMIN },
  { email: 'giangvien@hanzi.dev', fullName: 'Thầy Nguyễn Văn A', role: Role.TEACHER, vipUntil: addMonths(6) },
  { email: 'co_truong@hanzi.dev', fullName: 'Cô Trần Thị B',  role: Role.TEACHER, vipUntil: addMonths(12) },
  { email: 'hocvien1@hanzi.dev', fullName: 'Lê Văn Học',     role: Role.FREE },
  { email: 'hocvien2@hanzi.dev', fullName: 'Phạm Thị Nhớ',   role: Role.FREE, vipUntil: addMonths(1) },
  { email: 'hocvien3@hanzi.dev', fullName: 'Vũ Chữ Hán',     role: Role.FREE, vipUntil: addMonths(3) },
  { email: 'hocvien4@hanzi.dev', fullName: 'Trịnh Đắc Chữ',  role: Role.FREE },
  { email: 'hocvien5@hanzi.dev', fullName: 'Lý Minh Tâm',    role: Role.FREE, vipUntil: addMonths(12) },
];

function addMonths(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d;
}

async function run(): Promise<void> {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const subRepo = dataSource.getRepository(Subscription);

  for (const u of USERS) {
    // 1) Upsert user theo email (không dùng LOWER() ở app — DB đã có index)
    const existing = await userRepo.findOne({ where: { email: u.email } });
    let userId: string;
    if (existing) {
      userId = existing.id;
      existing.passwordHash = DEFAULT_PWD;
      await userRepo.save(existing);
      console.log(`User exists, updated password: ${u.email}`);
    } else {
      const saved = await userRepo.save({
        email: u.email,
        passwordHash: DEFAULT_PWD,
        fullName: u.fullName,
        role: u.role,
        status: UserStatus.ACTIVE,
      });
      userId = saved.id;
      console.log(`Created user: ${u.email} (${u.role})`);
    }

    // 2) Subscription — mỗi user chỉ có 1 dòng FREE/VIP, chỉ tạo nếu chưa có
    const subCount = await subRepo.count({ where: { userId } });
    if (subCount === 0) {
      const isVip = !!u.vipUntil;
      await subRepo.save({
        userId,
        plan: isVip ? SubscriptionPlan.VIP : SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
        startsAt: new Date(),
        expiresAt: u.vipUntil ?? null,
      });
      console.log(`  → Subscription: ${isVip ? 'VIP đến ' + u.vipUntil!.toISOString().slice(0,10) : 'FREE'}`);
    }
  }

  await dataSource.destroy();
  console.log('✅ seed-users completed');
}
run().catch(err => { console.error('❌ seed-users failed:', err); process.exit(1); });
import * as bcrypt from 'bcrypt';
import dataSource from '../data-source';
import { User } from '../../modules/auth/entities/user.entity';
import { Subscription } from '../../modules/subscription/entities/subscription.entity';
import { Role, UserStatus } from '../../common/enums/user.enums';
import { SubscriptionPlan, SubscriptionStatus } from '../../common/enums/subscription.enums';

/**
 * Seed tài khoản (idempotent — kiểm tra theo email):
 *  - 1 admin, 2 giáo viên, 100 học viên (FREE)
 * Password của TẤT CẢ account: "Test@1234"
 *
 * 100 student đủ cho stress 1000 VU share ~10 VU/user (tránh session contamination).
 */
const DEFAULT_PWD = bcrypt.hashSync('Test@1234', 10);
const NUM_BULK_STUDENTS = 495; // tổng 500 cùng 5 user cố định = 500 học viên

type UserSeed = { email: string; fullName: string; role: Role; vipUntil?: Date };

function addMonths(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d;
}

/** Tạo danh sách học viên bulk hocvien6..hocvien500 — toàn FREE (test quota). */
function buildBulkStudents(): UserSeed[] {
  const list: UserSeed[] = [];
  for (let i = 6; i <= NUM_BULK_STUDENTS + 5; i++) {
    list.push({
      email: `hocvien${i}@hanzi.dev`,
      fullName: `Học viên ${i}`,
      role: Role.FREE,
    });
  }
  return list;
}

const FIXED_USERS: UserSeed[] = [
  { email: 'admin@hanzi.dev',  fullName: 'Admin Hán Tự',     role: Role.ADMIN },
  { email: 'giangvien@hanzi.dev', fullName: 'Thầy Nguyễn Văn A', role: Role.TEACHER, vipUntil: addMonths(6) },
  { email: 'co_truong@hanzi.dev', fullName: 'Cô Trần Thị B',  role: Role.TEACHER, vipUntil: addMonths(12) },
  { email: 'hocvien1@hanzi.dev', fullName: 'Lê Văn Học',     role: Role.FREE },
  { email: 'hocvien2@hanzi.dev', fullName: 'Phạm Thị Nhớ',   role: Role.FREE, vipUntil: addMonths(1) },
  { email: 'hocvien3@hanzi.dev', fullName: 'Vũ Chữ Hán',     role: Role.FREE, vipUntil: addMonths(3) },
  { email: 'hocvien4@hanzi.dev', fullName: 'Trịnh Đắc Chữ',  role: Role.FREE },
  { email: 'hocvien5@hanzi.dev', fullName: 'Lý Minh Tâm',    role: Role.FREE, vipUntil: addMonths(12) },
];

const USERS: UserSeed[] = [...FIXED_USERS, ...buildBulkStudents()];

async function run(): Promise<void> {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);
  const subRepo = dataSource.getRepository(Subscription);

  console.log(`Seeding ${USERS.length} users (${FIXED_USERS.length} fixed + ${NUM_BULK_STUDENTS} bulk)...`);

  for (const u of USERS) {
    // 1) Upsert user theo email (không dùng LOWER() ở app — DB đã có index)
    const existing = await userRepo.findOne({ where: { email: u.email } });
    let userId: string;
    if (existing) {
      userId = existing.id;
      existing.passwordHash = DEFAULT_PWD;
      await userRepo.save(existing);
    } else {
      const saved = await userRepo.save({
        email: u.email,
        passwordHash: DEFAULT_PWD,
        fullName: u.fullName,
        role: u.role,
        status: UserStatus.ACTIVE,
      });
      userId = saved.id;
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
    }
  }

  await dataSource.destroy();
  console.log(`✅ seed-users completed: ${USERS.length} users`);
}
run().catch(err => { console.error('❌ seed-users failed:', err); process.exit(1); });
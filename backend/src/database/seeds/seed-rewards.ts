import dataSource from '../data-source';
import { Reward } from '../../modules/achievements/entities/reward.entity';
import { RewardType } from '../../common/enums/achievements.enums';

/**
 * Seed catalog rewards (PR-33). Idempotent — upsert by code.
 * Costs (spec §11 resolved):
 *  - AI Speaking 24h: 500 EXP (cày max 2.5 ngày)
 *  - Flashcard HSK nâng cao: 1000 EXP
 *  - Voucher giảm 10% khóa học: 2000 EXP
 *  - Voucher giảm 30% VIP 1 năm: 5000 EXP (gần 1 tháng cày)
 *  - Avatar Panda Gold: 800 EXP (cosmetic)
 */
const REWARDS: Partial<Reward>[] = [
  {
    code: 'vip_speaking_24h',
    title: 'AI Speaking VIP 24 giờ',
    type: RewardType.TEMPORARY_VIP,
    costExp: 500,
    metadata: { durationHours: 24, scope: ['ai_speaking'] },
    active: true,
  },
  {
    code: 'voucher_course_10pct',
    title: 'Voucher giảm 10% khóa học',
    type: RewardType.DISCOUNT_VOUCHER,
    costExp: 2000,
    metadata: { percent: 10, target: 'course' },
    active: true,
  },
  {
    code: 'voucher_vip_30pct',
    title: 'Voucher giảm 30% VIP 1 năm',
    type: RewardType.DISCOUNT_VOUCHER,
    costExp: 5000,
    metadata: { percent: 30, target: 'vip_annual' },
    active: true,
  },
  {
    code: 'flashcard_hsk_advanced',
    title: 'Bộ Flashcard HSK nâng cao',
    type: RewardType.CONTENT_UNLOCK,
    costExp: 1000,
    metadata: { contentId: 'flashcard-hsk-advanced' },
    active: true,
  },
  {
    code: 'avatar_panda_gold',
    title: 'Avatar Panda Gold',
    type: RewardType.COSMETIC,
    costExp: 800,
    metadata: { asset: 'avatar-panda-gold' },
    active: true,
  },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Reward);

  for (const r of REWARDS) {
    const existing = await repo.findOne({ where: { code: r.code! } });
    if (existing) {
      // Update nếu đã có (sync metadata/cost).
      Object.assign(existing, r);
      await repo.save(existing);
      console.log(`  ✓ Updated reward: ${r.code}`);
    } else {
      await repo.save(repo.create(r));
      console.log(`  + Created reward: ${r.code}`);
    }
  }

  console.log(`Seeded ${REWARDS.length} rewards.`);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Seed rewards failed:', err);
  process.exit(1);
});

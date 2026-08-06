import dataSource from '../data-source';
import { HskLevel } from '../../modules/curriculum/entities/hsk-level.entity';
import { PracticeLimitSettings } from '../../modules/subscription/entities/practice-limit-settings.entity';

/**
 * Seed dữ liệu nền tảng (idempotent — chạy lại an toàn):
 * - hsk_levels: HSK1..HSK9 (upsert theo code).
 * - practice_limit_settings: dòng cấu hình mặc định (chỉ tạo nếu chưa có).
 * Chạy: npm run seed
 */
const HSK_LEVELS: { code: string; name: string; displayOrder: number }[] = [
  { code: 'HSK1', name: 'HSK 1', displayOrder: 1 },
  { code: 'HSK2', name: 'HSK 2', displayOrder: 2 },
  { code: 'HSK3', name: 'HSK 3', displayOrder: 3 },
  { code: 'HSK4', name: 'HSK 4', displayOrder: 4 },
  { code: 'HSK5', name: 'HSK 5', displayOrder: 5 },
  { code: 'HSK6', name: 'HSK 6', displayOrder: 6 },
  { code: 'HSK7', name: 'HSK 7', displayOrder: 7 },
  { code: 'HSK8', name: 'HSK 8', displayOrder: 8 },
  { code: 'HSK9', name: 'HSK 9', displayOrder: 9 },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  console.log('Connected to database');

  // 1. HSK levels — upsert theo unique code
  const levelRepo = dataSource.getRepository(HskLevel);
  await levelRepo.upsert(HSK_LEVELS, ['code']);
  console.log(`Seeded ${HSK_LEVELS.length} HSK levels`);

  // 2. Practice limit settings — single-row config, chỉ tạo nếu trống
  const settingsRepo = dataSource.getRepository(PracticeLimitSettings);
  const existing = await settingsRepo.find();
  if (existing.length === 0) {
    await settingsRepo.save({
      freeLimit: 3,
      resetTimezone: 'Asia/Ho_Chi_Minh',
      enabled: true,
    });
    console.log('Seeded default practice_limit_settings');
  } else {
    console.log('practice_limit_settings already exists — skip');
  }

  await dataSource.destroy();
  console.log('Seed completed');
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

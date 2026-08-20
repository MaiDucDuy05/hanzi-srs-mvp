import dataSource from '../data-source';
import { SystemConfig, ConfigValueType, ConfigGroup } from '../../modules/config/entities/system-config.entity';

const CONFIGS: Partial<SystemConfig>[] = [
  // --- LIMITS ---
  {
    key: 'FREE_DAILY_PLAY_LIMIT',
    value: '3',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.LIMITS,
    description: 'Giới hạn số lần chơi miễn phí hàng ngày cho tài khoản Free',
  },
  {
    key: 'max_daily_exp',
    value: '200',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.GAMIFICATION,
    description: 'Giới hạn điểm kinh nghiệm (EXP) tối đa kiếm được mỗi ngày',
  },

  // --- EXP AWARDS ---
  {
    key: 'exp_base_reward',
    value: '10',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.GAMIFICATION,
    description: 'Điểm EXP cơ bản khi trả lời đúng',
  },
  {
    key: 'exp_perfect_reward',
    value: '5',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.GAMIFICATION,
    description: 'Điểm EXP thưởng thêm khi đạt điểm tuyệt đối',
  },
  {
    key: 'exp_combo_multiplier',
    value: '2',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.GAMIFICATION,
    description: 'Hệ số nhân EXP khi đạt combo liên tiếp',
  },

  // --- AI ---
  {
    key: 'AI_CHAT_DAILY_LIMIT',
    value: '10',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.AI,
    description: 'Số lần gọi AI chat tối đa mỗi ngày cho người dùng Free',
  },
  {
    key: 'AI_SPEAKING_ENABLED',
    value: 'true',
    valueType: ConfigValueType.BOOLEAN,
    group: ConfigGroup.AI,
    description: 'Bật/tắt tính năng AI chấm điểm phát âm',
  },
  {
    key: 'AI_EVALUATION_STRICTNESS',
    value: 'MEDIUM',
    valueType: ConfigValueType.STRING,
    group: ConfigGroup.AI,
    description: 'Độ khó chấm điểm của AI (LOW, MEDIUM, HIGH)',
  },

  // --- COMMERCE ---
  {
    key: 'VIP_GRACE_PERIOD_DAYS',
    value: '7',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.COMMERCE,
    description: 'Số ngày duy trì quyền lợi VIP sau khi hết hạn',
  },
  {
    key: 'VIP_PRICE_MONTHLY',
    value: '99000',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.COMMERCE,
    description: 'Giá gói VIP 1 tháng (VND)',
  },
  {
    key: 'VIP_PRICE_YEARLY',
    value: '990000',
    valueType: ConfigValueType.INT,
    group: ConfigGroup.COMMERCE,
    description: 'Giá gói VIP 1 năm (VND)',
  },

  // --- FEATURES ---
  {
    key: 'ENABLE_COMMUNITY_FEATURES',
    value: 'true',
    valueType: ConfigValueType.BOOLEAN,
    group: ConfigGroup.FEATURES,
    description: 'Bật/tắt các tính năng cộng đồng (bình luận, chia sẻ, ...)',
  },
  {
    key: 'ENABLE_LEADERBOARD',
    value: 'true',
    valueType: ConfigValueType.BOOLEAN,
    group: ConfigGroup.FEATURES,
    description: 'Bật/tắt bảng xếp hạng (Leaderboard)',
  },

  // --- SYSTEM ---
  {
    key: 'NOTIFICATION_FREQUENCY',
    value: 'MEDIUM',
    valueType: ConfigValueType.STRING,
    group: ConfigGroup.SYSTEM,
    description: 'Mức độ gửi thông báo cho học viên (LOW, MEDIUM, HIGH)',
  },
  {
    key: 'MAINTENANCE_MODE',
    value: 'false',
    valueType: ConfigValueType.BOOLEAN,
    group: ConfigGroup.SYSTEM,
    description: 'Bật/tắt chế độ bảo trì toàn hệ thống',
  }
];

async function seedConfigs() {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }

  const repo = dataSource.getRepository(SystemConfig);

  console.log('--- Bắt đầu seed System Configs ---');
  for (const item of CONFIGS) {
    let exist = await repo.findOne({ where: { key: item.key } });
    if (!exist) {
      const newConfig = repo.create(item);
      await repo.save(newConfig);
      console.log(`[+] Created config: ${item.key}`);
    } else {
      // Cập nhật lại giá trị default nếu chưa ai update (hoặc cứ ghi đè tuỳ ý, ở đây mình ghi đè cho chắc)
      Object.assign(exist, item);
      await repo.save(exist);
      console.log(`[~] Updated config: ${item.key}`);
    }
  }
  console.log('--- Hoàn tất seed System Configs ---\n');

  await dataSource.destroy();
}

seedConfigs().catch(e => {
  console.error(e);
  process.exit(1);
});

import dataSource from '../data-source';
import { Topic } from '../../modules/curriculum/entities/topic.entity';
import { TopicVocabulary } from '../../modules/curriculum/entities/topic-vocabulary.entity';
import { HskLevel } from '../../modules/curriculum/entities/hsk-level.entity';
import { Vocabulary } from '../../modules/curriculum/entities/vocabulary.entity';
import { ContentStatus } from '../../common/enums/curriculum.enums';

/**
 * Chủ đề học theo chủ đề (FR-02) — ưu tiên trẻ em, hình ảnh trực quan.
 * Vocab trong topic được map theo hanzi từ bảng vocab đã seed.
 */
type TopicDef = { name: string; slug: string; level: string; desc: string; hanziList: string[] };

const TOPICS: TopicDef[] = [
  { name: 'Chào hỏi & Lịch sự',       slug: 'greetings-manners',   level: 'HSK1', desc: 'Các câu chào hỏi, cảm ơn, xin lỗi hàng ngày', hanziList: ['你好','谢谢','再见'] },
  { name: 'Gia đình',                 slug: 'family',              level: 'HSK1', desc: 'Thành viên gia đình: bố mẹ, anh em',         hanziList: ['我','你','他'] },
  { name: 'Trường lớp',               slug: 'school-classroom',    level: 'HSK2', desc: 'Học sinh, giáo viên, sách vở, lớp học',       hanziList: ['学习','学生','老师','名字'] },
  { name: 'Ẩm thực – Nhà hàng',      slug: 'food-restaurant',     level: 'HSK3', desc: 'Gọi đồ ăn, nhà hàng, quán cà phê',            hanziList: ['饭店','咖啡','喝茶'] },
  { name: 'Bạn bè & Giao tiếp',       slug: 'friends-social',      level: 'HSK2', desc: 'Kết bạn, xin số, mời đi chơi cùng',           hanziList: ['朋友','一起','名字'] },
  { name: 'Hỗ trợ – Giúp đỡ',         slug: 'help-support',        level: 'HSK3', desc: 'Cách hỏi đường, nhờ giúp đỡ lịch sự',         hanziList: ['帮忙','一起'] },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const topicRepo = dataSource.getRepository(Topic);
  const tvRepo    = dataSource.getRepository(TopicVocabulary);
  const hskRepo   = dataSource.getRepository(HskLevel);
  const vocRepo   = dataSource.getRepository(Vocabulary);

  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i];
    const level = await hskRepo.findOne({ where: { code: t.level } });
    if (!level) continue;

    let topic = await topicRepo.findOne({ where: { slug: t.slug } });
    if (!topic) {
      topic = await topicRepo.save({
        name: t.name, slug: t.slug, description: t.desc,
        recommendedLevelId: level.id, status: ContentStatus.PUBLISHED, displayOrder: i + 1,
      });
      console.log(`+ Topic: ${t.name} (slug=${t.slug})`);
    } else {
      console.log(`= Topic exists: ${t.name}`);
    }

    // Gắn vocab theo hanzi (lấy id từ bảng vocab)
    let order = 1;
    for (const hz of t.hanziList) {
      const v = await vocRepo.findOne({ where: { hanzi: hz } });
      if (!v) continue;
      const has = await tvRepo.findOne({ where: { topicId: topic.id, vocabularyId: v.id } });
      if (!has) await tvRepo.save({ topicId: topic.id, vocabularyId: v.id, displayOrder: order++ });
    }
  }

  await dataSource.destroy();
  console.log('✅ seed-topics completed');
}
run().catch(err => { console.error('❌ seed-topics failed:', err); process.exit(1); });
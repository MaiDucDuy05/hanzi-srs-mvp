import dataSource from '../data-source';
import { HskLevel } from '../../modules/curriculum/entities/hsk-level.entity';
import { Lesson } from '../../modules/curriculum/entities/lesson.entity';
import { Vocabulary } from '../../modules/curriculum/entities/vocabulary.entity';
import { GrammarPoint } from '../../modules/curriculum/entities/grammar-point.entity';
import { LessonContent } from '../../modules/curriculum/entities/lesson-content.entity';
import { ContentStatus, ContentType } from '../../common/enums/curriculum.enums';

/**
 * Seed bài học, từ vựng, ngữ pháp theo từng cấp HSK (lấy HSK1-HSK3 cho đủ chi tiết, cấp sau ít hơn).
 * Idempotent: Vocab theo (level_id, hanzi); Lesson theo (level_id, title); Grammar theo (level_id, title).
 */
type Vocab = { hanzi: string; pinyin: string; vi: string };
type Gram  = { title: string; structure: string; explain: string };
type LesData = { title: string; desc: string; vocabIdx: number[]; gramIdx: number[] };
type LevelData = {
  code: string;
  vocab: Vocab[];
  grammar: Gram[];
  lessons: LesData[];
};

const DATA: Record<string, LevelData> = {
  HSK1: {
    code: 'HSK1',
    vocab: [
      { hanzi: '你好',   pinyin: 'nǐ hǎo',    vi: 'Xin chào' },
      { hanzi: '谢谢',   pinyin: 'xièxiè',    vi: 'Cảm ơn' },
      { hanzi: '再见',   pinyin: 'zài jiàn',  vi: 'Tạm biệt' },
      { hanzi: '我',     pinyin: 'wǒ',        vi: 'Tôi' },
      { hanzi: '你',     pinyin: 'nǐ',        vi: 'Bạn' },
      { hanzi: '他',     pinyin: 'tā',        vi: 'Anh ấy' },
      { hanzi: '好',     pinyin: 'hǎo',       vi: 'Tốt' },
      { hanzi: '不',     pinyin: 'bù',        vi: 'Không' },
    ],
    grammar: [
      { title: 'Cấu trúc 是 (shì)', structure: 'S + 是 + N', explain: 'Danh từ làm vị ngữ: "Tôi là sinh viên"' },
      { title: 'Phủ định 不 (bù)',  structure: '不 + V/Adj',  explain: 'Đặt trước động từ/tính từ để phủ định' },
    ],
    lessons: [
      { title: 'Bài 1: Lời chào cơ bản',  desc: 'Làm quen các câu chào hỏi đơn giản', vocabIdx: [0,1,2,7], gramIdx: [1] },
      { title: 'Bài 2: Đại nhân xưng',    desc: 'Tôi, bạn, anh ấy – cách dùng và phủ định', vocabIdx: [3,4,5,6,7], gramIdx: [0,1] },
      { title: 'Bài 3: Tổng hợp giao tiếp',desc: 'Ghép nối từ vựng để tạo câu hoàn chỉnh', vocabIdx: [0,1,2,3,4,5], gramIdx: [0,1] },
    ],
  },
  HSK2: {
    code: 'HSK2',
    vocab: [
      { hanzi: '名字', pinyin: 'míngzi',   vi: 'Tên' },
      { hanzi: '学习', pinyin: 'xuéxí',    vi: 'Học tập' },
      { hanzi: '学生', pinyin: 'xuésheng', vi: 'Học sinh' },
      { hanzi: '老师', pinyin: 'lǎoshī',   vi: 'Giáo viên' },
      { hanzi: '朋友', pinyin: 'péngyou',  vi: 'Bạn bè' },
      { hanzi: '中国', pinyin: 'Zhōngguó', vi: 'Trung Quốc' },
    ],
    grammar: [
      { title: 'Câu hỏi 吗 (ma)',      structure: 'Câu khẳng định + 吗？', explain: 'Chuyển câu khẳng định thành câu hỏi yes/no' },
      { title: 'Động từ thích hợp',   structure: 'S + 很 + Adj',           explain: 'Trợ từ trạng thái 很 = "rất"' },
    ],
    lessons: [
      { title: 'Bài 4: Học đường',      desc: 'Từ vựng trường lớp, học tập', vocabIdx: [0,1,2,3], gramIdx: [0] },
      { title: 'Bài 5: Giới thiệu bản thân', desc: 'Tên, quốc tịch, nghề nghiệp', vocabIdx: [0,4,5], gramIdx: [0,1] },
    ],
  },
  HSK3: {
    code: 'HSK3',
    vocab: [
      { hanzi: '饭店', pinyin: 'fàndiàn',   vi: 'Nhà hàng' },
      { hanzi: '咖啡', pinyin: 'kāfēi',     vi: 'Cà phê' },
      { hanzi: '喝茶', pinyin: 'hē chá',    vi: 'Uống trà' },
      { hanzi: '帮忙', pinyin: 'bāngmáng',  vi: 'Giúp đỡ' },
      { hanzi: '一起', pinyin: 'yīqǐ',      vi: 'Cùng nhau' },
    ],
    grammar: [
      { title: 'Cấu trúc 能/会',  structure: 'S + 能/会 + V', explain: 'Năng lực/khả năng (có thể làm gì đó)' },
    ],
    lessons: [
      { title: 'Bài 6: Nhà hàng & quán cà phê', desc: 'Đặt chỗ, gọi đồ, thanh toán', vocabIdx: [0,1,2,4], gramIdx: [0] },
      { title: 'Bài 7: Yêu cầu giúp đỡ',        desc: 'Cách đề nghị, xin sự hỗ trợ',  vocabIdx: [3,4],   gramIdx: [0] },
    ],
  },
};

async function run(): Promise<void> {
  await dataSource.initialize();
  const hskRepo   = dataSource.getRepository(HskLevel);
  const lesRepo   = dataSource.getRepository(Lesson);
  const vocRepo   = dataSource.getRepository(Vocabulary);
  const grmRepo   = dataSource.getRepository(GrammarPoint);
  const lcRepo    = dataSource.getRepository(LessonContent);

  for (const code of Object.keys(DATA)) {
    const { vocab, grammar, lessons } = DATA[code];
    const level = await hskRepo.findOne({ where: { code } });
    if (!level) { console.warn(`⚠ Level ${code} chưa có, chạy seed-hsk-levels trước!`); continue; }

    // Seed vocabularies
    const vocabIds: (string|null)[] = [];
    for (let i = 0; i < vocab.length; i++) {
      const v = vocab[i];
      const ex = await vocRepo.findOne({ where: { levelId: level.id, hanzi: v.hanzi } });
      if (ex) { vocabIds.push(ex.id); continue; }
      const s = await vocRepo.save({ levelId: level.id, hanzi: v.hanzi, pinyin: v.pinyin, meaningVi: v.vi, status: ContentStatus.PUBLISHED });
      vocabIds.push(s.id);
    }
    console.log(`[${code}] Vocab: ${vocab.filter((_,i)=>vocabIds[i]!==null).length} (new ${vocabIds.filter((_,i)=>i>=0).length - vocab.length + vocabIds.filter(x=>x!==null).length})`);

    // Seed grammar points
    const gramIds: (string|null)[] = [];
    for (let i = 0; i < grammar.length; i++) {
      const g = grammar[i];
      const ex = await grmRepo.findOne({ where: { levelId: level.id, title: g.title } });
      if (ex) { gramIds.push(ex.id); continue; }
      const s = await grmRepo.save({ levelId: level.id, title: g.title, structure: g.structure, explanation: g.explain, status: ContentStatus.PUBLISHED });
      gramIds.push(s.id);
    }

    // Seed lessons + lesson_contents
    for (let li = 0; li < lessons.length; li++) {
      const L = lessons[li];
      let lesson = await lesRepo.findOne({ where: { levelId: level.id, title: L.title } });
      if (!lesson) {
        lesson = await lesRepo.save({
          levelId: level.id, title: L.title, description: L.desc,
          displayOrder: li + 1, status: ContentStatus.PUBLISHED, publishedAt: new Date(),
        });
        console.log(`[${code}] + Lesson: ${L.title}`);
      } else {
        console.log(`[${code}] = Lesson exists: ${L.title}`);
      }
      // Liên kết vocab + grammar vào lesson
      let order = 1;
      for (const vi of L.vocabIdx) {
        const cid = vocabIds[vi]!;
        const has = await lcRepo.findOne({ where: { lessonId: lesson.id, contentType: ContentType.VOCABULARY, contentId: cid } });
        if (!has) await lcRepo.save({ lessonId: lesson.id, contentType: ContentType.VOCABULARY, contentId: cid, displayOrder: order++ });
      }
      for (const gi of L.gramIdx) {
        const cid = gramIds[gi]!;
        const has = await lcRepo.findOne({ where: { lessonId: lesson.id, contentType: ContentType.GRAMMAR, contentId: cid } });
        if (!has) await lcRepo.save({ lessonId: lesson.id, contentType: ContentType.GRAMMAR, contentId: cid, displayOrder: order++ });
      }
    }
  }

  await dataSource.destroy();
  console.log('✅ seed-curriculum completed');
}
run().catch(err => { console.error('❌ seed-curriculum failed:', err); process.exit(1); });
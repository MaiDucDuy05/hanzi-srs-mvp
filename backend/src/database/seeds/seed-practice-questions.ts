import dataSource from '../data-source';
import { PracticeQuestion } from '../../modules/practice/entities/practice-question.entity';
import { HskLevel } from '../../modules/curriculum/entities/hsk-level.entity';
import { Lesson } from '../../modules/curriculum/entities/lesson.entity';
import { ContentStatus } from '../../common/enums/curriculum.enums';
import { PracticeAnswerType, PracticeQuestionType } from '../../common/enums/practice.enums';

/**
 * Câu hỏi luyện tập cho 2 loại: FILL_BLANK (điền từ) & SENTENCE_ORDERING (sắp xếp).
 * Idempotent: nhận biết bằng (prompt + level_id).
 */
type PQ = {
  type: PracticeQuestionType; levelCode: string; lessonMatch: RegExp | null;
  prompt: string;
  qData: Record<string, unknown>;
  aData: Record<string, unknown>;
  accepted?: string[];        // cho FILL_BLANK
  answerType?: PracticeAnswerType;
  translation?: string;
  explain?: string;
};

const QUESTIONS: PQ[] = [
  // ======== FILL_BLANK (HSK1) ========
  {
    type: PracticeQuestionType.FILL_BLANK, levelCode: 'HSK1', lessonMatch: /Bài 1/,
    prompt: '______，bạn khỏe không？（Xin chào）',
    qData: { withHanzi: true, choices: ['你好','谢谢','再见','好'] },
    aData: { answer: '你好', blankIndex: 0 },
    accepted: ['你好'], answerType: PracticeAnswerType.HANZI,
    translation: 'Xin chào, bạn khỏe không？', explain: '你好 = Xin chào, dùng để mở đầu hội thoại.',
  },
  {
    type: PracticeQuestionType.FILL_BLANK, levelCode: 'HSK1', lessonMatch: /Bài 2/,
    prompt: '______ 是学生。（Tôi là học sinh）',
    qData: { withHanzi: true, choices: ['我','你','他','不'] },
    aData: { answer: '我', blankIndex: 0 },
    accepted: ['我'], answerType: PracticeAnswerType.HANZI,
    translation: 'Tôi là học sinh.', explain: '我 = Tôi (đại nhân xưng ngôi thứ 1).',
  },
  {
    type: PracticeQuestionType.FILL_BLANK, levelCode: 'HSK1', lessonMatch: /Bài 2/,
    prompt: '他______ 老师。（Không phải）',
    qData: { withHanzi: true, choices: ['是','不是','好','不'] },
    aData: { answer: '不是', blankIndex: 1 },
    accepted: ['不是'], answerType: PracticeAnswerType.HANZI,
    translation: 'Anh ấy không phải giáo viên.', explain: '不 + 是 = 不是 (phủ định danh từ).',
  },
  // ======== SENTENCE_ORDERING (HSK1 & HSK2) ========
  {
    type: PracticeQuestionType.SENTENCE_ORDERING, levelCode: 'HSK1', lessonMatch: /Bài 2/,
    prompt: 'Sắp xếp thành câu đúng: 我 / 喜 / 欢 / 喝 / 茶',
    qData: { tokens: [
      { id: 't1', text: '我' }, { id: 't2', text: '喜' }, { id: 't3', text: '欢' }, { id: 't4', text: '喝' }, { id: 't5', text: '茶' },
    ]},
    aData: { orderedTokenIds: ['t1','t2','t3','t4','t5'] },
    translation: 'Tôi thích uống trà.', explain: 'Cấu trúc S + V + O.',
  },
  {
    type: PracticeQuestionType.SENTENCE_ORDERING, levelCode: 'HSK2', lessonMatch: /Bài 4/,
    prompt: 'Sắp xếp thành câu đúng: 你 / 学生 / 是 / 吗？',
    qData: { tokens: [
      { id: 't1', text: '你' }, { id: 't2', text: '学生' }, { id: 't3', text: '是' }, { id: 't4', text: '吗？' },
    ]},
    aData: { orderedTokenIds: ['t1','t3','t2','t4'] },
    translation: 'Bạn có phải học sinh không？', explain: 'Cấu trúc S + 是 + N + 吗？',
  },
  {
    type: PracticeQuestionType.SENTENCE_ORDERING, levelCode: 'HSK2', lessonMatch: /Bài 4/,
    prompt: 'Sắp xếp thành câu đúng: 昨天 / 北京 / 去 / 他 / 了',
    qData: { tokens: [
      { id: 't1', text: '昨天' }, { id: 't2', text: '北京' }, { id: 't3', text: '去' }, { id: 't4', text: '他' }, { id: 't5', text: '了' },
    ]},
    aData: { orderedTokenIds: ['t4','t1','t3','t2','t5'] }, // 他 昨天 去 北京 了
    translation: 'Hôm qua anh ấy đã đi Bắc Kinh.', explain: 'Trạng từ chỉ thời gian thường đứng sau chủ ngữ và trước động từ.',
  },
  // ======== FILL_BLANK (HSK3) ========
  {
    type: PracticeQuestionType.FILL_BLANK, levelCode: 'HSK3', lessonMatch: /Bài 6/,
    prompt: '我们______ 去喝咖啡吧！',
    qData: { withHanzi: true, choices: ['一起','帮忙','饭店','喝茶'] },
    aData: { answer: '一起', blankIndex: 1 },
    accepted: ['一起'], answerType: PracticeAnswerType.HANZI,
    translation: 'Chúng ta cùng nhau đi uống cà phê nhé！', explain: '一起 = cùng nhau (phó từ chỉ sự đồng hành).',
  },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const pqRepo  = dataSource.getRepository(PracticeQuestion);
  const hskRepo = dataSource.getRepository(HskLevel);
  const lesRepo = dataSource.getRepository(Lesson);

  for (const q of QUESTIONS) {
    const lvl = await hskRepo.findOne({ where: { code: q.levelCode } });
    if (!lvl) continue;
    let lessonId: string | null = null;
    if (q.lessonMatch) {
      const L = await lesRepo.findOne({ where: { levelId: lvl.id } }).then(() =>
        lesRepo.find({ where: { levelId: lvl.id } }).then(all => all.find(x => q.lessonMatch!.test(x.title)) ?? null)
      );
      if (L) lessonId = L.id;
    }
    // Idempotent: trùng prompt + level_id thì skip
    const has = await pqRepo.findOne({ where: { prompt: q.prompt, levelId: lvl.id } });
    if (has) { console.log(`= Practice Q exists: ${q.prompt.slice(0,24)}…`); continue; }
    await pqRepo.save({
      questionType: q.type,
      levelId: lvl.id, lessonId,
      prompt: q.prompt, questionData: q.qData, answerData: q.aData,
      acceptedAnswers: q.accepted ? { list: q.accepted } : null,
      answerType: q.answerType ?? null,
      translation: q.translation ?? null, explanation: q.explain ?? null,
      status: ContentStatus.PUBLISHED,
    });
    console.log(`+ Practice Q [${q.type}] ${q.levelCode}: ${q.prompt.slice(0,24)}…`);
  }

  await dataSource.destroy();
  console.log('✅ seed-practice-questions completed');
}
run().catch(err => { console.error('❌ seed-practice-questions failed:', err); process.exit(1); });
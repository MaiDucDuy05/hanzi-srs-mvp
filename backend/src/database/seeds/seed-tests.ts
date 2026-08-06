import dataSource from '../data-source';
import { Test } from '../../modules/test/entities/test.entity';
import { TestQuestion } from '../../modules/test/entities/test-question.entity';
import { User } from '../../modules/auth/entities/user.entity';
import { TestStatus, TestQuestionType } from '../../common/enums/test.enums';

/**
 * Bài kiểm tra mẫu do giáo viên tạo.
 * - 1 bài HSK1 (câu hỏi trắc nghiệm + đúng/sai)
 * - 1 bài HSK2 (trắc nghiệm + trả lời ngắn)
 */
type TQ = { type: TestQuestionType; content: string; points: number; options?: string[]; correct: string | string[] | boolean };
type TestDef = {
  teacherEmail: string; name: string; desc: string;
  timeLimit: number; attemptLimit: number; accessCode: string;
  questions: TQ[];
};

const TESTS: TestDef[] = [
  {
    teacherEmail: 'giangvien@hanzi.dev',
    name: 'Kiểm tra giữa kỳ HSK 1',
    desc: 'Đề 25 phút — bao gồm chào hỏi, đại nhân xưng, phủ định.',
    timeLimit: 25, attemptLimit: 2, accessCode: 'HSK1-2026',
    questions: [
      { type: TestQuestionType.SINGLE_CHOICE, points: 2, content: '"你好" nghĩa là gì？',
        options: ['Cảm ơn','Xin chào','Tạm biệt','Hẹn gặp lại'], correct: 'Xin chào' },
      { type: TestQuestionType.TRUE_FALSE,   points: 1, content: '"我" nghĩa là "bạn" (ngôi thứ 2).', correct: false },
      { type: TestQuestionType.SINGLE_CHOICE, points: 2, content: 'Từ nào có nghĩa "không"？',
        options: ['好','不','是','你'], correct: '不' },
      { type: TestQuestionType.SHORT_ANSWER, points: 3, content: 'Viết 3 từ vựng đã học về lời chào (tiếng Trung).',
        correct: ['你好','谢谢','再见'] },
    ],
  },
  {
    teacherEmail: 'co_truong@hanzi.dev',
    name: 'Đề kiểm tra 15 phút HSK2',
    desc: 'Cấu trúc câu hỏi 吗 + trạng từ 很.',
    timeLimit: 15, attemptLimit: 1, accessCode: 'HSK2-15M',
    questions: [
      { type: TestQuestionType.SINGLE_CHOICE, points: 2,
        content: 'Câu nào là câu hỏi đúng?',
        options: ['你是学生吗？','你是学生不？','吗你是学生？','你是学生很？'], correct: '你是学生吗？' },
      { type: TestQuestionType.TRUE_FALSE, points: 1, content: '"很" có nghĩa là "rất".', correct: true },
      { type: TestQuestionType.SHORT_ANSWER, points: 4,
        content: 'Sắp xếp các từ thành câu hoàn chỉnh: 很 好 他',
        correct: ['他很好'] },
    ],
  },
];

async function run(): Promise<void> {
  await dataSource.initialize();
  const testRepo = dataSource.getRepository(Test);
  const tqRepo   = dataSource.getRepository(TestQuestion);
  const userRepo = dataSource.getRepository(User);

  for (const T of TESTS) {
    const teacher = await userRepo.findOne({ where: { email: T.teacherEmail } });
    if (!teacher) { console.warn(`⚠ Teacher ${T.teacherEmail} chưa có, chạy seed-users trước!`); continue; }

    let test = await testRepo.findOne({ where: { teacherId: teacher.id, name: T.name } });
    if (!test) {
      test = await testRepo.save({
        teacherId: teacher.id, name: T.name, description: T.desc,
        timeLimitMinutes: T.timeLimit, attemptLimit: T.attemptLimit,
        status: TestStatus.PUBLISHED, accessCode: T.accessCode, showScoreImmediately: true,
      });
      console.log(`+ Test: ${T.name} [access=${T.accessCode}]`);
    } else {
      console.log(`= Test exists: ${T.name}`);
    }

    // Questions — nếu số lượng khác thì insert thêm (giữ nguyên các câu cũ, idempotent theo content + testId)
    for (let i = 0; i < T.questions.length; i++) {
      const q = T.questions[i];
      const has = await tqRepo.findOne({ where: { testId: test.id, content: q.content } });
      if (has) continue;

      // Chuẩn hóa JSONB cho options/correct
      const options = q.options ? { list: q.options } : null;
      let correctJsonb: Record<string, unknown>;
      if (q.type === TestQuestionType.SINGLE_CHOICE) correctJsonb = { answer: q.correct as string };
      else if (q.type === TestQuestionType.TRUE_FALSE) correctJsonb = { answer: q.correct as boolean };
      else correctJsonb = { accepted: q.correct as string[] }; // SHORT_ANSWER

      await tqRepo.save({
        testId: test.id, questionType: q.type, content: q.content,
        options, correctAnswer: correctJsonb, points: q.points, displayOrder: i + 1,
      });
    }
    console.log(`  → ${T.questions.length} questions processed`);
  }

  await dataSource.destroy();
  console.log('✅ seed-tests completed');
}
run().catch(err => { console.error('❌ seed-tests failed:', err); process.exit(1); });
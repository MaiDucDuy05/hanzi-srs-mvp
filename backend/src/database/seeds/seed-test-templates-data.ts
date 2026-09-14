import { TestCategory } from '../../common/enums/test.enums';
import { QuestionSkill } from '../../modules/question-bank/entities/question.enums';

/**
 * Mau de thi HSK theo TestCategory (PR-05 + TestTemplate).
 * Cau truc bam sat chuan HSK 2.0 (HSK 1-6) dang pho bien hien nay,
 * them placeholder HSK 7-9 (chuan 3.0 moi 2022).
 *
 * Phan bo TestCategory theo tung cap HSK:
 *   HSK 1: QUIZ_15M, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 2: QUIZ_15M, TEST_1H, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 3: QUIZ_15M, TEST_1H, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 4: QUIZ_15M, TEST_1H, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 5: TEST_1H, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 6: TEST_1H, MID_TERM, FINAL_EXAM, CUSTOM
 *   HSK 7: FINAL_EXAM (placeholder)
 *   HSK 9: FINAL_EXAM (placeholder)
 */
export type TemplateSectionDef = {
  name: string;
  skill: QuestionSkill;
  count: number;
  groups?: number;
  points?: number;
  instruction?: string;
};

export type TemplateDef = {
  category: TestCategory;
  hskLevel: number;
  name: string;
  description: string;
  timeLimitMinutes: number;
  sections: TemplateSectionDef[];
};

export const HSK_TEMPLATES: TemplateDef[] = [
  // ═══════════════════ HSK 1 ═══════════════════
  {
    category: TestCategory.QUIZ_15M, hskLevel: 1,
    name: 'Kiem tra 15 phut - HSK 1',
    description: 'On tap nhanh: 8 nghe + 8 doc (HSK 1 chua co phan viet).',
    timeLimitMinutes: 15,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 8, groups: 0, points: 1, instruction: 'Nghe va chon dap an dung.' },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 8, groups: 0, points: 1, instruction: 'Doc va chon dap an dung.' },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 1,
    name: 'Thi giua ky - HSK 1',
    description: 'HSK 1 chinh thuc: 40 cau (20 nghe + 20 doc).',
    timeLimitMinutes: 35,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 20, groups: 0, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 20, groups: 0, points: 1 },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 1,
    name: 'Thi cuoi ky - HSK 1',
    description: 'HSK 1 chinh thuc: 40 cau (20 nghe + 20 doc).',
    timeLimitMinutes: 35,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 20, groups: 0, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 20, groups: 0, points: 1 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 1,
    name: 'Bai tap tuy chinh - HSK 1',
    description: 'Bai tap linh hoat cho giao vien. Cau truc co the chinh sua sau.',
    timeLimitMinutes: 10,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 5, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 5, points: 1 },
    ],
  },

  // ═══════════════════ HSK 2 ═══════════════════
  {
    category: TestCategory.QUIZ_15M, hskLevel: 2,
    name: 'Kiem tra 15 phut - HSK 2',
    description: '10 nghe + 8 doc.',
    timeLimitMinutes: 15,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 10, groups: 0, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 8,  groups: 0, points: 1 },
    ],
  },
  {
    category: TestCategory.TEST_1H, hskLevel: 2,
    name: 'Kiem tra 1 tieng - HSK 2',
    description: 'HSK 2 mo rong: 35 nghe + 25 doc.',
    timeLimitMinutes: 60,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 35, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 25, groups: 1, points: 1 },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 2,
    name: 'Thi giua ky - HSK 2',
    description: 'HSK 2 chinh thuc: 60 cau (35 nghe + 25 doc).',
    timeLimitMinutes: 55,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 35, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 25, groups: 1, points: 1 },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 2,
    name: 'Thi cuoi ky - HSK 2',
    description: 'HSK 2 chinh thuc: 60 cau (35 nghe + 25 doc).',
    timeLimitMinutes: 55,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 35, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 25, groups: 1, points: 1 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 2,
    name: 'Bai tap tuy chinh - HSK 2',
    description: 'Bai tap linh hoat cho giao vien.',
    timeLimitMinutes: 15,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 8, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 7, points: 1 },
    ],
  },

  // ═══════════════════ HSK 3 ═══════════════════
  {
    category: TestCategory.QUIZ_15M, hskLevel: 3,
    name: 'Kiem tra 15 phut - HSK 3',
    description: '7 nghe + 6 doc + 2 viet.',
    timeLimitMinutes: 15,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 7, groups: 0, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, groups: 0, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 2, groups: 0, points: 1 },
    ],
  },
  {
    category: TestCategory.TEST_1H, hskLevel: 3,
    name: 'Kiem tra 1 tieng - HSK 3',
    description: '25 nghe + 22 doc + 8 viet.',
    timeLimitMinutes: 60,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 25, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 22, groups: 1, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 8,  groups: 0, points: 1 },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 3,
    name: 'Thi giua ky - HSK 3',
    description: 'HSK 3 chinh thuc: 80 cau (40 nghe + 30 doc + 10 viet).',
    timeLimitMinutes: 85,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 40, groups: 3, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 30, groups: 2, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 10, groups: 0, points: 2, instruction: 'Sap xep tu thanh cau hoan chinh.' },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 3,
    name: 'Thi cuoi ky - HSK 3',
    description: 'HSK 3 chinh thuc: 80 cau (40 nghe + 30 doc + 10 viet).',
    timeLimitMinutes: 85,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 40, groups: 3, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 30, groups: 2, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 10, groups: 0, points: 2 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 3,
    name: 'Bai tap tuy chinh - HSK 3',
    description: 'Bai tap linh hoat cho giao vien.',
    timeLimitMinutes: 20,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 6, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 3, points: 1 },
    ],
  },
];
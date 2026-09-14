import { TestCategory } from '../../common/enums/test.enums';
import { QuestionSkill } from '../../modules/question-bank/entities/question.enums';
import type { TemplateDef } from './seed-test-templates-data';

/** HSK 4 - them cac TestCategory con lai (HSK 4 chinh thuc: 100 cau). */
export const HSK4_TEMPLATES: TemplateDef[] = [
  {
    category: TestCategory.QUIZ_15M, hskLevel: 4,
    name: 'Kiem tra 15 phut - HSK 4',
    description: '7 nghe + 6 doc + 2 viet.',
    timeLimitMinutes: 15,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 7, groups: 0, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, groups: 0, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 2, groups: 0, points: 2 },
    ],
  },
  {
    category: TestCategory.TEST_1H, hskLevel: 4,
    name: 'Kiem tra 1 tieng - HSK 4',
    description: '27 nghe + 24 doc + 9 viet.',
    timeLimitMinutes: 60,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 27, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 24, groups: 3, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 9,  groups: 0, points: 2 },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 4,
    name: 'Thi giua ky - HSK 4',
    description: 'HSK 4 chinh thuc: 100 cau (45 nghe + 40 doc + 15 viet).',
    timeLimitMinutes: 105,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 45, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 40, groups: 5, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 15, groups: 0, points: 2, instruction: 'Sap xep tu thanh cau hoan chinh (35-40 tu vung HSK 4).' },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 4,
    name: 'Thi cuoi ky - HSK 4',
    description: 'HSK 4 chinh thuc: 100 cau (45 nghe + 40 doc + 15 viet).',
    timeLimitMinutes: 105,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 45, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 40, groups: 5, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 15, groups: 0, points: 2 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 4,
    name: 'Bai tap tuy chinh - HSK 4',
    description: 'Bai tap linh hoat cho giao vien.',
    timeLimitMinutes: 25,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 6, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 3, points: 2 },
    ],
  },
];

/** HSK 5 - khong co QUIZ_15M (HSK 5 qua kho cho 15 phut). */
export const HSK5_TEMPLATES: TemplateDef[] = [
  {
    category: TestCategory.TEST_1H, hskLevel: 5,
    name: 'Kiem tra 1 tieng - HSK 5',
    description: '22 nghe + 22 doc + 6 viet.',
    timeLimitMinutes: 60,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 22, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 22, groups: 2, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 6,  groups: 0, points: 3 },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 5,
    name: 'Thi giua ky - HSK 5',
    description: 'HSK 5 chinh thuc: 100 cau (45 nghe + 45 doc + 10 viet).',
    timeLimitMinutes: 120,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 45, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 45, groups: 5, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 10, groups: 0, points: 3, instruction: 'Sap xep tu va sua loi thanh cau hoan chinh (2500 tu vung HSK 5).' },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 5,
    name: 'Thi cuoi ky - HSK 5',
    description: 'HSK 5 chinh thuc: 100 cau (45 nghe + 45 doc + 10 viet).',
    timeLimitMinutes: 120,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 45, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 45, groups: 5, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 10, groups: 0, points: 3 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 5,
    name: 'Bai tap tuy chinh - HSK 5',
    description: 'Bai tap linh hoat cho giao vien.',
    timeLimitMinutes: 30,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 6, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 3, points: 3 },
    ],
  },
];

/** HSK 6 - Writing la 1 bai luan, khong co QUIZ_15M. */
export const HSK6_TEMPLATES: TemplateDef[] = [
  {
    category: TestCategory.TEST_1H, hskLevel: 6,
    name: 'Kiem tra 1 tieng - HSK 6',
    description: '22 nghe + 22 doc + 1 bai luan ngan.',
    timeLimitMinutes: 60,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 22, groups: 2, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 22, groups: 2, points: 1 },
      { name: 'Phan 3: Viet luan ngan', skill: QuestionSkill.WRITING, count: 1, groups: 0, points: 10, instruction: 'Viet 100-120 chu theo chu de.' },
    ],
  },
  {
    category: TestCategory.MID_TERM, hskLevel: 6,
    name: 'Thi giua ky - HSK 6',
    description: 'HSK 6 chinh thuc: 101 cau (50 nghe + 50 doc + 1 bai luan).',
    timeLimitMinutes: 135,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 50, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 50, groups: 5, points: 1 },
      { name: 'Phan 3: Viet bai luan', skill: QuestionSkill.WRITING, count: 1, groups: 0, points: 30, instruction: 'Viet bai luan 400-600 chu (doc va tom tat doan van 1000 chu).' },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 6,
    name: 'Thi cuoi ky - HSK 6',
    description: 'HSK 6 chinh thuc: 101 cau (50 nghe + 50 doc + 1 bai luan).',
    timeLimitMinutes: 135,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 50, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 50, groups: 5, points: 1 },
      { name: 'Phan 3: Viet bai luan', skill: QuestionSkill.WRITING, count: 1, groups: 0, points: 30 },
    ],
  },
  {
    category: TestCategory.CUSTOM_ASSIGNMENT, hskLevel: 6,
    name: 'Bai tap tuy chinh - HSK 6',
    description: 'Bai tap linh hoat cho giao vien.',
    timeLimitMinutes: 40,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 6, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 6, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 1, points: 10, instruction: 'Viet doan van 150-200 chu.' },
    ],
  },
];

/** HSK 7-9 (chuan 3.0 moi 2022 - placeholder, se cap nhat theo Hanban). */
export const HSK7_9_TEMPLATES: TemplateDef[] = [
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 7,
    name: 'Thi cuoi ky - HSK 7 (chuan 3.0)',
    description: 'HSK 7 (chuan 3.0): 50 nghe + 50 doc + 2 viet. Cau truc co the cap nhat theo Hanban.',
    timeLimitMinutes: 120,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 50, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 50, groups: 5, points: 1 },
      { name: 'Phan 3: Viet',      skill: QuestionSkill.WRITING,   count: 2,  groups: 0, points: 15 },
    ],
  },
  {
    category: TestCategory.FINAL_EXAM, hskLevel: 9,
    name: 'Thi cuoi ky - HSK 9 (chuan 3.0)',
    description: 'HSK 9 (cao cap nhat): de sieu kho, 50 nghe + 50 doc + 2 viet chuyen sau.',
    timeLimitMinutes: 150,
    sections: [
      { name: 'Phan 1: Nghe hieu', skill: QuestionSkill.LISTENING, count: 50, groups: 4, points: 1 },
      { name: 'Phan 2: Doc hieu',  skill: QuestionSkill.READING,   count: 50, groups: 5, points: 1 },
      { name: 'Phan 3: Viet nang cao', skill: QuestionSkill.WRITING, count: 2, groups: 0, points: 20 },
    ],
  },
];
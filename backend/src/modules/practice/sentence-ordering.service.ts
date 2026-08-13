/**
 * SentenceOrderingService — Fisher-Yates shuffle + snapshot management.
 *
 * PR-10 §3.4:
 * 1. Lấy N câu SENTENCE_ORDERING đã PUBLISH (theo levelId/lessonId).
 * 2. Mỗi câu: sao chép tokens → Fisher-Yates shuffle.
 * 3. Nếu shuffle trùng đáp án → shuffle lại.
 * 4. Snapshot questionData + answerData vào attempt.
 * 5. Trả shuffled tokens, KHÔNG trả answerData.
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { SourceType } from '../../common/enums/practice.enums';

export interface SentenceToken {
  id: string;
  text: string;
}

export interface SentenceQuestion {
  questionId: string;
  tokens: SentenceToken[];       // shuffled — gửi cho frontend
  translation: string | null;
  explanation: string | null | null;
}

export interface SentenceOrderingSnapshot {
  questions: SentenceQuestion[];
  /** Chỉ dùng khi bắt đầu bài, không gửi cho frontend */
  correctAnswers: Record<string, string[]>; // questionId → correct tokenIds[]
}

@Injectable()
export class SentenceOrderingService {
  constructor(
    @InjectRepository(PracticeQuestion)
    private qRepo: Repository<PracticeQuestion>,
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
    @InjectRepository(TopicVocabulary)
    private tvRepo: Repository<TopicVocabulary>,
  ) {}

  /**
   * Shuffle Fisher-Yates (in-place).
   * Seeded-based deterministic shuffle: dùng attemptId làm seed
   * để cùng một attempt luôn cho cùng kết quả shuffle.
   */
  private fisherYates<T>(arr: T[], seed: string): T[] {
    const a = [...arr];
    let m = a.length;
    // Simple deterministic seed from string
    let seedNum = this.hashString(seed);
    while (m > 0) {
      const i = Math.floor(this.seededRandom(seedNum) * m);
      m--;
      [a[m], a[i]] = [a[i], a[m]];
    }
    return a;
  }

  /** Simple djb2-like hash từ string → number. */
  private hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
    }
    return Math.abs(h);
  }

  /** Linear congruential generator theo seed. */
  private seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  /**
   * Kiểm tra mảng token đã shuffle có trùng với đáp án đúng không.
   */
  private isSameOrder(shuffled: SentenceToken[], correctIds: string[]): boolean {
    return shuffled.every((t, i) => t.id === correctIds[i]);
  }

  /**
   * Bắt đầu bài sắp xếp câu — shuffle tokens và lưu snapshot vào attempt.
   *
   * @param attemptId  — ID của attempt đã được tạo bởi PracticeAttemptService.start()
   * @param sourceId   — lessonId / levelId / topicId (tùy sourceType)
   * @param sourceType — LESSON / LEVEL / TOPIC
   * @param topicId    — nếu sourceType = TOPIC, truyền topicId
   * @param count      — số câu hỏi muốn lấy (mặc định 5, max 10)
   * @returns danh sách câu đã shuffle + snapshot để lưu vào attempt
   */
  async startSentenceOrdering(
    attemptId: string,
    sourceId: string,
    sourceType: SourceType,
    topicId?: string,
    count = 5,
  ): Promise<{ questions: SentenceQuestion[]; snapshot: SentenceOrderingSnapshot }> {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');

    let questions: PracticeQuestion[];

    if (topicId) {
      // TOPIC: lấy vocabularyIds của topic → filter PracticeQuestion theo lessonId/levelId
      const tvRecords = await this.tvRepo.find({ where: { topicId } });
      const vocabIds = [...new Set(tvRecords.map((r) => r.vocabularyId))];

      // Lấy vocabularies để biết levelId của chúng (vocab không có lessonId)
      const vocabRepo = this.tvRepo.manager.getRepository(Vocabulary);
      const vocabs = await vocabRepo.find({ where: { id: In(vocabIds) } });
      const levelIds = [...new Set(vocabs.map((v) => v.levelId).filter(Boolean) as string[])];

      questions = await this.qRepo.find({
        where: {
          questionType: 'SENTENCE_ORDERING' as any,
          status: 'PUBLISHED' as any,
          ...(levelIds.length ? { levelId: In(levelIds) } : {}),
        } as any,
        order: { createdAt: 'DESC' },
        take: Math.min(count, 10),
      });
    } else {
      // LESSON hoặc LEVEL
      questions = await this.qRepo.find({
        where: {
          questionType: 'SENTENCE_ORDERING' as any,
          status: 'PUBLISHED' as any,
          ...(sourceType === SourceType.LESSON
            ? { lessonId: sourceId }
            : { levelId: sourceId }),
        } as any,
        order: { createdAt: 'DESC' },
        take: Math.min(count, 10),
      });
    }

    // Nếu không đủ câu → dùng số câu hiện có (PR-10 §3.5)
    const snapshot: SentenceOrderingSnapshot = { questions: [], correctAnswers: {} };
    const shuffledQuestions: SentenceQuestion[] = [];

    for (const q of questions) {
      const qData = (q.questionData ?? {}) as { tokens?: SentenceToken[] };
      const aData = (q.answerData ?? {}) as { correctOrder?: string[] };
      const tokens: SentenceToken[] = qData.tokens ?? [];
      const correctIds: string[] = aData.correctOrder ?? [];

      if (tokens.length === 0 || correctIds.length === 0) continue;

      // Fisher-Yates shuffle với seed = attemptId + questionId
      let shuffled = this.fisherYates(tokens, `${attemptId}-${q.id}`);

      // Nếu trùng thứ tự đúng → shuffle lại
      let attempts = 0;
      while (this.isSameOrder(shuffled, correctIds) && attempts < 10) {
        shuffled = this.fisherYates(shuffled, `${attemptId}-${q.id}-${++attempts}`);
      }

      shuffledQuestions.push({
        questionId: q.id,
        tokens: shuffled,
        translation: q.translation,
        explanation: q.explanation,
      });

      snapshot.correctAnswers[q.id] = correctIds;
    }

    snapshot.questions = shuffledQuestions;
    return { questions: shuffledQuestions, snapshot };
  }
}

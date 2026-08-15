import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { PracticeQuestion } from './entities/practice-question.entity';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { SourceType } from '../../common/enums/practice.enums';

export interface FillBlankQuestion {
  questionId: string;
  prompt: string;
  options: string[];
  translation: string | null;
  explanation: string | null;
}

export interface FillBlankSnapshot {
  questions: FillBlankQuestion[];
  correctAnswers: Record<string, string>; // questionId -> answerText
}

@Injectable()
export class FillBlankService {
  constructor(
    @InjectRepository(PracticeQuestion)
    private qRepo: Repository<PracticeQuestion>,
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
    @InjectRepository(TopicVocabulary)
    private tvRepo: Repository<TopicVocabulary>,
    private dataSource: DataSource,
  ) {}

  private seededRandom(seed: number): number {
    const x = Math.sin(seed + 1) * 10000;
    return x - Math.floor(x);
  }

  private simpleHash(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
    return Math.abs(h);
  }

  async startFillBlank(
    attemptId: string,
    sourceId: string,
    sourceType: SourceType,
    topicId?: string,
    count = 5,
  ): Promise<{ questions: FillBlankQuestion[]; snapshot: FillBlankSnapshot }> {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');

    let questions: PracticeQuestion[];

    if (topicId) {
      const tvRecords = await this.tvRepo.find({ where: { topicId } });
      const vocabIds = [...new Set(tvRecords.map((r) => r.vocabularyId))];
      const vocabRepo = this.tvRepo.manager.getRepository(Vocabulary);
      const vocabs = await vocabRepo.find({ where: { id: In(vocabIds) } });
      const levelIds = [...new Set(vocabs.map((v) => v.levelId).filter(Boolean) as string[])];

      questions = await this.qRepo.find({
        where: {
          questionType: 'FILL_BLANK' as any,
          status: 'PUBLISHED' as any,
          ...(levelIds.length ? { levelId: In(levelIds) } : {}),
        } as any,
        order: { createdAt: 'DESC' },
        take: Math.min(count, 10),
      });
    } else {
      questions = await this.qRepo.find({
        where: {
          questionType: 'FILL_BLANK' as any,
          status: 'PUBLISHED' as any,
          ...(sourceType === SourceType.LESSON ? { lessonId: sourceId } : { levelId: sourceId }),
        } as any,
        order: { createdAt: 'DESC' },
        take: Math.min(count, 10),
      });
    }

    if (questions.length === 0) {
      throw new NotFoundException('Không tìm thấy câu hỏi điền từ cho nguồn này.');
    }

    const resultQuestions: FillBlankQuestion[] = [];
    const correctAnswers: Record<string, string> = {};

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const seed = this.simpleHash(attemptId + q.id);
      
      const qData = q.questionData as any;
      const options = Array.isArray(qData?.choices) ? qData.choices : [];
      
      const accepted = q.acceptedAnswers as any;
      let correctAnswer = '';
      if (Array.isArray(accepted?.list) && accepted.list.length > 0) {
        correctAnswer = accepted.list[0];
      }

      // Shuffle options using seed
      const shuffledOptions = [...options].sort((a, b) => this.seededRandom(seed + this.simpleHash(a)) - 0.5);

      resultQuestions.push({
        questionId: q.id,
        prompt: q.prompt || '___',
        options: shuffledOptions,
        translation: q.translation,
        explanation: q.explanation,
      });

      correctAnswers[q.id] = correctAnswer;
    }

    const snapshot: FillBlankSnapshot = {
      questions: resultQuestions,
      correctAnswers,
    };

    attempt.questionData = { snapshot, correctAnswers } as unknown as Record<string, unknown>;
    await this.attemptRepo.save(attempt);

    return { questions: resultQuestions, snapshot };
  }
}

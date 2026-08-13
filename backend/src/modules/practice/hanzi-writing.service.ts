/**
 * HanziWritingService — PR-13.
 *
 * Responsibilities:
 * 1. Resolve characters from source (level/lesson/topic).
 * 2. Validate characters exist in char data (optional, deferred to client).
 * 3. Store session data (chars list) in attempt.questionData.
 * 4. On complete: validate chars belong to attempt, save mistakes + duration.
 */
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PracticeAttempt } from './entities/practice-attempt.entity';
import { Vocabulary } from '../curriculum/entities/vocabulary.entity';
import { TopicVocabulary } from '../curriculum/entities/topic-vocabulary.entity';
import { LessonContent } from '../curriculum/entities/lesson-content.entity';
import { StartHanziWritingDto, CompleteHanziWritingDto } from './hanzi-writing.dto';
import { SourceType } from '../../common/enums/practice.enums';
import { PracticeAttemptStatus } from '../../common/enums/practice.enums';
import { ContentType } from '../../common/enums/curriculum.enums';

export interface HanziChar {
  char: string;
  pinyin: string;
  meaning: string;
  audioKey: string | null;
  vocabularyId: string;
}

function ok(data: unknown, msg: string) {
  return { data, message: msg };
}

@Injectable()
export class HanziWritingService {
  constructor(
    @InjectRepository(PracticeAttempt)
    private attemptRepo: Repository<PracticeAttempt>,
    @InjectRepository(Vocabulary)
    private vocabRepo: Repository<Vocabulary>,
    @InjectRepository(TopicVocabulary)
    private tvRepo: Repository<TopicVocabulary>,
    @InjectRepository(LessonContent)
    private lcRepo: Repository<LessonContent>,
  ) {}

  /**
   * Resolve characters from source.
   * Returns unique hanzi characters extracted from vocabulary.
   */
  async resolveChars(dto: StartHanziWritingDto): Promise<HanziChar[]> {
    let vocabularies: Vocabulary[];

    if (dto.topicId) {
      // TOPIC: join table → vocabulary IDs → vocabularies
      const tvRecords = await this.tvRepo.find({ where: { topicId: dto.topicId } });
      const vocabIds = [...new Set(tvRecords.map((r) => r.vocabularyId))];
      if (vocabIds.length === 0) return [];
      vocabularies = await this.vocabRepo.find({ where: { id: In(vocabIds) } });
    } else if (dto.lessonId) {
      // LESSON: lesson_contents (VOCABULARY) → vocabulary IDs
      const lcRecords = await this.lcRepo.find({
        where: {
          lessonId: dto.lessonId,
          contentType: ContentType.VOCABULARY as any,
        },
      });
      if (lcRecords.length === 0) return [];
      const vocabIds = lcRecords.map((r) => r.contentId);
      vocabularies = await this.vocabRepo.find({ where: { id: In(vocabIds) } });
    } else if (dto.levelId) {
      // LEVEL: all vocabularies in this HSK level
      vocabularies = await this.vocabRepo.find({ where: { levelId: dto.levelId } });
    } else {
      throw new BadRequestException('Must provide levelId, lessonId, or topicId');
    }

    // Extract unique hanzi characters
    const charMap = new Map<string, HanziChar>();
    for (const v of vocabularies) {
      for (const char of v.hanzi) {
        if (!charMap.has(char)) {
          charMap.set(char, {
            char,
            pinyin: v.pinyin,
            meaning: v.meaningVi,
            audioKey: v.audioKey,
            vocabularyId: v.id,
          });
        }
      }
    }

    return Array.from(charMap.values());
  }

  /**
   * Save session chars into attempt.questionData.
   */
  async saveSessionChars(attemptId: string, chars: HanziChar[]): Promise<void> {
    await this.attemptRepo.update(attemptId, {
      questionData: { characters: chars } as any,
    });
  }

  /**
   * Validate attempt ownership + status, then save results.
   */
  async complete(
    attemptId: string,
    userId: string,
    dto: CompleteHanziWritingDto,
  ): Promise<{ completedChars: number; totalMistakes: number }> {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.userId !== userId) throw new NotFoundException('Attempt not found');
    if (attempt.status !== PracticeAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Attempt is not in progress');
    }

    // Validate all chars belong to this attempt's session
    const sessionChars = ((attempt.questionData as any) ?? {}).characters ?? [];
    const sessionCharSet = new Set((sessionChars as HanziChar[]).map((c) => c.char));
    const submittedChars = dto.characters.map((c) => c.char);

    const invalid = submittedChars.filter((c) => !sessionCharSet.has(c));
    if (invalid.length > 0) {
      throw new BadRequestException(`Invalid characters: ${invalid.join(', ')}`);
    }

    // Count completed (not skipped) and total mistakes
    const completedChars = dto.characters.filter((c) => !c.skipped).length;
    const totalMistakes = dto.characters.reduce((sum, c) => sum + (c.mistakes ?? 0), 0);

    await this.attemptRepo.update(attemptId, {
      answerData: { characters: dto.characters } as any,
      score: completedChars,
      correctCount: completedChars,
      wrongCount: dto.characters.filter((c) => c.skipped).length,
      durationSeconds: dto.durationSeconds,
      status: PracticeAttemptStatus.COMPLETED,
      completedAt: new Date(),
    });

    return { completedChars, totalMistakes };
  }
}

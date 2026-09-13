import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { GoogleGenAI } from '@google/genai';
import { STUDY_PROMPTS, GEMINI_JSON_CONFIG, GEMINI_FALLBACK_MODELS } from './study.prompts';

@Injectable()
export class StudyService {
  private ai: GoogleGenAI;

  constructor(
    private configService: ConfigService,
    private dataSource: DataSource
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. AI generation will fail.');
    }
    // Only pass API key if we have one, otherwise let it try to find it in the environment
    this.ai = new GoogleGenAI(apiKey ? { apiKey } : {});
  }

  private async logSilentError(jobName: string, errorMessage: string) {
    try {
      await this.dataSource.query(
        `INSERT INTO system_job_logs (job_name, status, last_run, error_message, created_at, updated_at) 
         VALUES ($1, 'ERROR', NOW(), $2, NOW(), NOW())`,
        [jobName, errorMessage]
      );
    } catch (e) {
      console.error('Failed to log silent error to system_job_logs', e);
    }
  }

  private async generateWithRetry(prompt: string) {
    let lastError: any;

    for (const model of GEMINI_FALLBACK_MODELS) {
      try {
        return await this.ai.models.generateContent({
          ...GEMINI_JSON_CONFIG,
          model,
          contents: prompt,
        });
      } catch (error: any) {
        lastError = error;
        console.warn(`[StudyService] Error with model ${model}: ${error.message || error.status}. Retrying with next model...`);
        // Continue to the next model in the array on ANY error (rate limit, service down, etc)
        continue;
      }
    }

    console.error('[StudyService] All fallback models failed.');
    throw lastError;
  }

  async generateStory(words: string[], topic: string, level: string) {
    if (!words || words.length === 0) {
      throw new Error('Words list is required.');
    }

    const wordsStr = words.join(', ');
    
    const prompt = STUDY_PROMPTS.generateStory(topic, level, wordsStr);

    try {
      const response = await this.generateWithRetry(prompt);
      
      const responseText = response.text;
      if (!responseText) throw new Error('Empty response from model');
      
      // Basic JSON cleanup just in case
      const jsonStr = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const result = JSON.parse(jsonStr);
      
      return {
        storyZh: result.storyZh || '',
        storyVi: result.storyVi || '',
      };
    } catch (error) {
      console.error('Error generating story with Gemini:', error);
      throw new InternalServerErrorException('Failed to generate story.');
    }
  }

  async generateGrammarExamples(title: string, structure: string, explanation: string) {
    const prompt = STUDY_PROMPTS.generateGrammarExamples(title, structure, explanation);

    try {
      const response = await this.generateWithRetry(prompt);
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '[]';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating grammar examples:', error);
      throw new InternalServerErrorException('Failed to generate grammar examples.');
    }
  }

  async generateGrammarPractice(title: string, structure: string) {
    const prompt = STUDY_PROMPTS.generateGrammarPractice(title, structure);

    try {
      const response = await this.generateWithRetry(prompt);
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating grammar practice:', error);
      throw new InternalServerErrorException('Failed to generate grammar practice.');
    }
  }

  async gradeGrammarPractice(title: string, structure: string, promptVi: string, userAnswer: string) {
    const prompt = STUDY_PROMPTS.gradeGrammarPractice(title, structure, promptVi, userAnswer);

    try {
      const response = await this.generateWithRetry(prompt);
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error grading grammar practice:', error);
      throw new InternalServerErrorException('Failed to grade grammar practice.');
    }
  }

  async generateGrammarStory(grammarTitles: string[], topic: string, level: string) {
    if (!grammarTitles || grammarTitles.length === 0) {
      throw new Error('Grammar list is required.');
    }

    const grammarsStr = grammarTitles.join(', ');
    
    const prompt = STUDY_PROMPTS.generateGrammarStory(topic, level, grammarsStr);

    try {
      const response = await this.generateWithRetry(prompt);
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      const result = JSON.parse(jsonStr);
      
      return {
        storyZh: result.storyZh || '',
        storyVi: result.storyVi || '',
      };
    } catch (error) {
      console.error('Error generating grammar story:', error);
      throw new InternalServerErrorException('Failed to generate grammar story.');
    }
  }

  async checkSpelling(text: string) {
    if (!text || !text.trim()) {
      return { hasError: false, suggestions: [] };
    }

    const prompt = STUDY_PROMPTS.checkSpelling(text);

    try {
      const response = await this.generateWithRetry(prompt);

      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      const result = JSON.parse(jsonStr);
      
      const suggestions = (result.suggestions || []).map((sug: any) => {
        const start = text.indexOf(sug.wrong);
        return {
          wrong: sug.wrong,
          correct: sug.correct,
          start: start >= 0 ? start : 0,
          end: start >= 0 ? start + sug.wrong.length : 0,
        };
      }).filter((sug: any) => sug.start >= 0 && sug.wrong);

      return {
        hasError: suggestions.length > 0,
        suggestions: suggestions,
      };
    } catch (error: any) {
      console.error('Error checking spelling with Gemini:', error);
      const msg = error.message?.substring(0, 1000) || 'Unknown Gemini error';
      this.logSilentError('External API - Gemini checkSpelling', msg).catch(() => {});
      return { hasError: false, suggestions: [] };
    }
  }

  async generateExamQuestions(dto: any) {
    const { lessonId, vocabIds, customWords, count = 5, level = 'HSK 1', questionTypes = ['SINGLE_CHOICE', 'FILL_IN', 'ORDERING'], difficulty = 'MEDIUM' } = dto;

    let targetVocabularies: Array<{ hanzi: string; pinyin?: string; meaningVi?: string }> = [];

    // 1. Fetch vocabularies if lessonId provided
    if (lessonId) {
      const lessonVocabs = await this.dataSource.query(
        `SELECT v.id, v.hanzi, v.pinyin, v.meaning_vi as "meaningVi"
         FROM lesson_contents lc
         JOIN vocabularies v ON v.id = lc.content_id
         WHERE lc.lesson_id = $1 AND lc.content_type = 'VOCABULARY'
         ORDER BY lc.display_order ASC`,
        [lessonId]
      );
      if (lessonVocabs && lessonVocabs.length > 0) {
        targetVocabularies.push(...lessonVocabs);
      }
    }

    // 2. Fetch vocabularies if vocabIds provided
    if (vocabIds && vocabIds.length > 0) {
      const specificVocabs = await this.dataSource.query(
        `SELECT id, hanzi, pinyin, meaning_vi as "meaningVi"
         FROM vocabularies
         WHERE id = ANY($1)`,
        [vocabIds]
      );
      if (specificVocabs && specificVocabs.length > 0) {
        // Merge without duplicating
        const existingIds = new Set(targetVocabularies.map((v: any) => v.id));
        for (const sv of specificVocabs) {
          if (!existingIds.has(sv.id)) {
            targetVocabularies.push(sv);
          }
        }
      }
    }

    // 3. Include custom words if any
    if (customWords && customWords.length > 0) {
      for (const w of customWords) {
        targetVocabularies.push({ hanzi: w.trim() });
      }
    }

    if (targetVocabularies.length === 0) {
      throw new InternalServerErrorException('No vocabulary words found for this lesson or selection.');
    }

    const wordsInfo = targetVocabularies
      .map(v => `${v.hanzi}${v.pinyin ? ` (${v.pinyin})` : ''}${v.meaningVi ? `: ${v.meaningVi}` : ''}`)
      .join('\n');

    const prompt = STUDY_PROMPTS.generateExamQuestions(level, wordsInfo, count, questionTypes);

    try {
      const response = await this.generateWithRetry(prompt);
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '[]';
      const parsedQuestions = JSON.parse(jsonStr);

      if (!Array.isArray(parsedQuestions)) {
        throw new Error('AI response is not an array of questions');
      }

      // Format and ensure properties
      return parsedQuestions.map((q: any) => ({
        type: q.type || 'SINGLE_CHOICE',
        difficulty: q.difficulty || difficulty,
        targetVocab: q.targetVocab,
        explanation: q.explanation || null,
        content: q.content || {},
      }));
    } catch (error: any) {
      console.error('Error generating exam questions with Gemini:', error);
      throw new InternalServerErrorException('Failed to generate exam questions using AI.');
    }
  }

  async generateAndCreateTest(dto: any, userId: string) {
    const creatorId = dto.teacherId || userId;
    const questions = (Array.isArray(dto.questions) && dto.questions.length > 0)
      ? dto.questions
      : await this.generateExamQuestions(dto);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create Question bank items for each generated question
      const questionIds: string[] = [];
      for (const q of questions) {
        const insertRes = await queryRunner.query(
          `INSERT INTO questions (
            creator_id, type, source_type, hsk_level, lesson_id, 
            content, explanation, difficulty, visibility, is_active, 
            created_at, updated_at
          ) VALUES ($1, $2, 'EXAM', $3, $4, $5, $6, $7, 'PRIVATE', true, NOW(), NOW())
          RETURNING id`,
          [
            creatorId,
            q.type,
            dto.hskLevel || 1,
            dto.lessonId || null,
            JSON.stringify(q.content),
            q.explanation || null,
            q.difficulty || 'MEDIUM'
          ]
        );
        if (insertRes && insertRes[0]?.id) {
          questionIds.push(insertRes[0].id);
        }
      }

      // 2. Create Test
      const testRes = await queryRunner.query(
        `INSERT INTO tests (
          name, description, teacher_id, hsk_level, 
          time_limit_minutes, attempt_limit, status, 
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'DRAFT', NOW(), NOW())
        RETURNING *`,
        [
          dto.testName,
          dto.description || `AI generated test from lesson vocabulary`,
          creatorId,
          dto.hskLevel || 1,
          dto.timeLimitMinutes || 30,
          dto.attemptLimit || 1
        ]
      );


      const createdTest = testRes[0];

      // 3. Link questions to test via test_questions
      for (let i = 0; i < questionIds.length; i++) {
        await queryRunner.query(
          `INSERT INTO test_questions (
            test_id, question_id, points, display_order, 
            created_at, updated_at
          ) VALUES ($1, $2, 1, $3, NOW(), NOW())`,
          [createdTest.id, questionIds[i], i + 1]
        );
      }

      await queryRunner.commitTransaction();

      return {
        test: createdTest,
        totalQuestions: questionIds.length,
        questions,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error saving AI generated exam test:', error);
      throw new InternalServerErrorException('Failed to create test from AI questions');
    } finally {
      await queryRunner.release();
    }
  }
}

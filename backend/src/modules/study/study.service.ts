import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { STUDY_PROMPTS, GEMINI_JSON_CONFIG, GEMINI_FALLBACK_MODELS } from './study.prompts';

@Injectable()
export class StudyService {
  private ai: GoogleGenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not defined. AI generation will fail.');
    }
    // Only pass API key if we have one, otherwise let it try to find it in the environment
    this.ai = new GoogleGenAI(apiKey ? { apiKey } : {});
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
    } catch (error) {
      console.error('Error checking spelling with Gemini:', error);
      return { hasError: false, suggestions: [] };
    }
  }
}

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';

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

  async generateStory(words: string[], topic: string, level: string) {
    if (!words || words.length === 0) {
      throw new Error('Words list is required.');
    }

    const wordsStr = words.join(', ');
    
    const prompt = `You are a professional Chinese language teacher. Write a short, engaging story in simplified Chinese based on the topic "${topic}" suitable for a student at the "${level}" proficiency level.
You MUST include all of the following vocabulary words naturally in the story: ${wordsStr}.

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting or backticks:
{
  "storyZh": "The Chinese story here...",
  "storyVi": "The Vietnamese translation here..."
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
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
    const prompt = `You are a professional Chinese language teacher. The student is learning the following grammar point:
Title: ${title}
Structure: ${structure}
Explanation: ${explanation}

Generate exactly 3 practical and common examples using this grammar structure.
Return ONLY a valid JSON array of objects matching this schema exactly, with no markdown formatting:
[
  {
    "zh": "Chinese sentence here",
    "pinyin": "Pinyin here (with tone marks)",
    "vi": "Vietnamese translation here"
  }
]`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '[]';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating grammar examples:', error);
      throw new InternalServerErrorException('Failed to generate grammar examples.');
    }
  }

  async generateGrammarPractice(title: string, structure: string) {
    const prompt = `You are a professional Chinese language teacher. The student is practicing the grammar point:
Title: ${title}
Structure: ${structure}

Generate 1 sentence in Vietnamese that the student must translate into Chinese using this exact grammar structure.
Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "promptVi": "Vietnamese sentence for the student to translate",
  "expectedZh": "The expected Chinese translation"
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
      const jsonStr = response.text?.replace(/```json/gi, '').replace(/```/g, '').trim() || '{}';
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error('Error generating grammar practice:', error);
      throw new InternalServerErrorException('Failed to generate grammar practice.');
    }
  }

  async gradeGrammarPractice(title: string, structure: string, promptVi: string, userAnswer: string) {
    const prompt = `You are a strict but encouraging Chinese language teacher. The student is practicing the grammar point:
Title: ${title}
Structure: ${structure}

The student was asked to translate this Vietnamese sentence into Chinese: "${promptVi}"
The student's answer: "${userAnswer}"

Evaluate their answer. 
1. Is it grammatically correct and natural?
2. Did they successfully use the required grammar structure?

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "Your detailed feedback in Vietnamese explaining what was good, what was wrong, and how to improve. If incorrect, provide the correct answer."
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
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
    
    const prompt = `You are a professional Chinese language teacher. Write a short, engaging dialogue or story in simplified Chinese based on the topic "${topic}" suitable for a student at the "${level}" proficiency level.
You MUST include all of the following grammar points naturally in the text: ${grammarsStr}.

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "storyZh": "The Chinese text here...",
  "storyVi": "The Vietnamese translation here..."
}`;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });
      
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
}

import { Controller, Post, Body } from '@nestjs/common';
import { StudyService } from './study.service';
import { GenerateStoryDto } from './dto/generate-story.dto';
import { GenerateGrammarExamplesDto, GenerateGrammarPracticeDto, GradeGrammarPracticeDto, GenerateGrammarStoryDto } from './dto/grammar.dto';
import { CheckSpellingDto } from './dto/check-spelling.dto';

@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post('generate-story')
  async generateStory(@Body() dto: GenerateStoryDto) {
    return this.studyService.generateStory(dto.words, dto.topic, dto.level);
  }

  @Post('grammar-examples')
  async generateGrammarExamples(@Body() dto: GenerateGrammarExamplesDto) {
    return this.studyService.generateGrammarExamples(dto.title, dto.structure, dto.explanation);
  }

  @Post('grammar-practice-generate')
  async generateGrammarPractice(@Body() dto: GenerateGrammarPracticeDto) {
    return this.studyService.generateGrammarPractice(dto.title, dto.structure);
  }

  @Post('grammar-practice-grade')
  async gradeGrammarPractice(@Body() dto: GradeGrammarPracticeDto) {
    return this.studyService.gradeGrammarPractice(dto.title, dto.structure, dto.promptVi, dto.userAnswer);
  }

  @Post('grammar-story')
  async generateGrammarStory(@Body() dto: GenerateGrammarStoryDto) {
    return this.studyService.generateGrammarStory(dto.grammarTitles, dto.topic, dto.level);
  }

  @Post('check-spelling')
  async checkSpelling(@Body() dto: CheckSpellingDto) {
    return this.studyService.checkSpelling(dto.text);
  }
}

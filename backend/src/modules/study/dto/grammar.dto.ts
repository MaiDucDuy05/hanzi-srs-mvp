import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class GenerateGrammarExamplesDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  structure: string;

  @IsString()
  @IsNotEmpty()
  explanation: string;
}

export class GenerateGrammarPracticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  structure: string;
}

export class GradeGrammarPracticeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  structure: string;

  @IsString()
  @IsNotEmpty()
  promptVi: string;

  @IsString()
  @IsNotEmpty()
  userAnswer: string;
}

export class GenerateGrammarStoryDto {
  @IsArray()
  @IsString({ each: true })
  grammarTitles: string[];

  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsString()
  @IsNotEmpty()
  level: string;
}

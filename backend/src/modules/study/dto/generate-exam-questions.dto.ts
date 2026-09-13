import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { TestQuestionType } from '../../../common/enums/test.enums';
import { QuestionDifficulty } from '../../question-bank/entities/question.enums';

export class GenerateExamQuestionsDto {
  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vocabIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  customWords?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  count?: number = 10;


  @IsOptional()
  @IsString()
  level?: string = 'HSK 1';

  @IsOptional()
  @IsArray()
  questionTypes?: string[] = [TestQuestionType.SINGLE_CHOICE, TestQuestionType.FILL_IN, TestQuestionType.ORDERING];

  @IsOptional()
  @IsEnum(QuestionDifficulty)
  difficulty?: QuestionDifficulty = QuestionDifficulty.MEDIUM;
}

export class GenerateAndCreateTestDto extends GenerateExamQuestionsDto {
  @IsNotEmpty()
  @IsString()
  testName: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(180)
  timeLimitMinutes?: number = 30;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  attemptLimit?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(6)
  hskLevel?: number = 1;
}

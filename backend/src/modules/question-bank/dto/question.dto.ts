import { IsString, IsOptional, IsInt, IsEnum, IsArray, IsObject, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { TestQuestionType } from '../../../common/enums/test.enums';
import { QuestionDifficulty, QuestionVisibility } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsEnum(TestQuestionType) type: TestQuestionType;
  @IsOptional() @IsEnum(QuestionVisibility) visibility?: QuestionVisibility;
  @IsOptional() @IsInt() @Min(1) @Max(9) hskLevel?: number;
  @IsOptional() @IsString() lessonId?: string;
  @IsOptional() @IsEnum(QuestionDifficulty) difficulty?: QuestionDifficulty;
  @IsObject() content: Record<string, unknown>;
  @IsOptional() @IsString() explanation?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
}

export class UpdateQuestionDto extends CreateQuestionDto {}

export class QueryQuestionDto {
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() page?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() limit?: number;
  @IsOptional() @IsEnum(TestQuestionType) type?: TestQuestionType;
  @IsOptional() @IsEnum(QuestionVisibility) visibility?: QuestionVisibility;
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() hskLevel?: number;
  @IsOptional() @IsEnum(QuestionDifficulty) difficulty?: QuestionDifficulty;
  @IsOptional() @IsString() tags?: string;
  @IsOptional() @IsString() search?: string;
}

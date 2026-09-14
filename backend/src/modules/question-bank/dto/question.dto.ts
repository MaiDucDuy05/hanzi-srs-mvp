import { IsString, IsOptional, IsInt, IsEnum, IsArray, IsObject, Min, Max, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { TestQuestionType } from '../../../common/enums/test.enums';
import { QuestionDifficulty, QuestionVisibility, QuestionSkill } from '../entities/question.entity';

export class CreateQuestionDto {
  @IsEnum(TestQuestionType) type: TestQuestionType;
  @IsOptional() @IsEnum(QuestionVisibility) visibility?: QuestionVisibility;
  @IsOptional() @IsInt() @Min(1) @Max(9) hskLevel?: number;
  @IsOptional() @IsString() lessonId?: string;
  @IsOptional() @IsEnum(QuestionDifficulty) difficulty?: QuestionDifficulty;
  @IsObject() content: Record<string, unknown>;
  @IsOptional() @IsString() explanation?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsEnum(QuestionSkill) skill?: QuestionSkill;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class UpdateQuestionDto {
  @IsOptional() @IsEnum(TestQuestionType) type?: TestQuestionType;
  @IsOptional() @IsEnum(QuestionVisibility) visibility?: QuestionVisibility;
  @IsOptional() @IsInt() @Min(1) @Max(9) hskLevel?: number;
  @IsOptional() @IsString() lessonId?: string;
  @IsOptional() @IsEnum(QuestionDifficulty) difficulty?: QuestionDifficulty;
  @IsOptional() @IsObject() content?: Record<string, unknown>;
  @IsOptional() @IsString() explanation?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @IsOptional() @IsUUID() parentId?: string;
  @IsOptional() @IsEnum(QuestionSkill) skill?: QuestionSkill;
  @IsOptional() @IsInt() displayOrder?: number;
}

export class QueryQuestionDto {
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() page?: number;
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() limit?: number;
  @IsOptional() @IsEnum(TestQuestionType) type?: TestQuestionType;
  @IsOptional() @IsEnum(QuestionVisibility) visibility?: QuestionVisibility;
  @IsOptional() @Transform(({ value }) => parseInt(value)) @IsInt() hskLevel?: number;
  @IsOptional() @IsEnum(QuestionDifficulty) difficulty?: QuestionDifficulty;
  @IsOptional() @IsString() tags?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsEnum(QuestionSkill) skill?: QuestionSkill;
}

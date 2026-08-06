import { IsEnum, IsInt, IsJSON, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PracticeQuestionType, PracticeAnswerType, PracticeType, SourceType, PracticeAttemptStatus } from '../../../common/enums/practice.enums';

export class CreatePracticeQuestionDto {
  @IsEnum(PracticeQuestionType) questionType: PracticeQuestionType;
  @IsOptional() @IsUUID() levelId?: string | null;
  @IsOptional() @IsUUID() lessonId?: string | null;
  @IsOptional() @IsString() prompt?: string | null;
  @IsOptional() questionData?: Record<string, unknown> | null;
  @IsOptional() answerData?: Record<string, unknown> | null;
  @IsOptional() acceptedAnswers?: Record<string, unknown> | null;
  @IsOptional() @IsEnum(PracticeAnswerType) answerType?: PracticeAnswerType | null;
  @IsOptional() @IsString() translation?: string | null;
  @IsOptional() @IsString() explanation?: string | null;
}

export class UpdatePracticeQuestionDto {
  @IsOptional() @IsEnum(PracticeQuestionType) questionType?: PracticeQuestionType;
  @IsOptional() @IsUUID() levelId?: string | null;
  @IsOptional() @IsUUID() lessonId?: string | null;
  @IsOptional() @IsString() prompt?: string | null;
  @IsOptional() questionData?: Record<string, unknown> | null;
  @IsOptional() answerData?: Record<string, unknown> | null;
  @IsOptional() acceptedAnswers?: Record<string, unknown> | null;
  @IsOptional() @IsEnum(PracticeAnswerType) answerType?: PracticeAnswerType | null;
  @IsOptional() @IsString() translation?: string | null;
  @IsOptional() @IsString() explanation?: string | null;
}

export class StartPracticeAttemptDto {
  @IsEnum(PracticeType) practiceType: PracticeType;
  @IsEnum(SourceType) sourceType: SourceType;
  @IsString() sourceId: string;
  @IsOptional() @IsString() idempotencyKey?: string | null;
  @IsOptional() questionData?: Record<string, unknown> | null;
}

export class SubmitPracticeAttemptDto {
  @IsOptional() answerData?: Record<string, unknown> | null;
  @IsInt() @Min(0) score: number;
  @IsInt() @Min(0) correctCount: number;
  @IsInt() @Min(0) wrongCount: number;
  @IsInt() @Min(0) moveCount: number;
  @IsInt() @Min(0) durationSeconds: number;
}

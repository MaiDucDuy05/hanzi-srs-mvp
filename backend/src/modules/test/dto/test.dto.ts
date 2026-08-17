import { IsBoolean, IsEnum, IsInt, IsJSON, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { TestStatus, TestQuestionType, TestAttemptStatus } from '../../../common/enums/test.enums';
import { PaginationQueryDto } from '../../../common/pagination.dto';

// ── Query DTOs ──

export class TestQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() teacherId?: string;
  @IsOptional() @IsEnum(TestStatus) status?: TestStatus;
}

export class TestQuestionQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() testId?: string;
}

export class TestAttemptQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() testId?: string;
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEnum(TestAttemptStatus) status?: TestAttemptStatus;
}

// ── Create/Update DTOs ──

export class CreateTestDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsInt() @Min(0) timeLimitMinutes?: number;
  @IsOptional() @IsInt() @Min(1) attemptLimit?: number;
  @IsOptional() @IsInt() @Min(1) hskLevel?: number;
  @IsOptional() @IsBoolean() shuffleQuestions?: boolean;
  @IsOptional() @IsBoolean() showAnswersAfter?: boolean;
  @IsOptional() @IsBoolean() showScoreImmediately?: boolean;
  @IsOptional() @IsString() accessCode?: string | null;
}

export class UpdateTestDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsInt() @Min(0) timeLimitMinutes?: number;
  @IsOptional() @IsInt() @Min(1) attemptLimit?: number;
  @IsOptional() @IsInt() @Min(1) hskLevel?: number;
  @IsOptional() @IsBoolean() shuffleQuestions?: boolean;
  @IsOptional() @IsBoolean() showAnswersAfter?: boolean;
  @IsOptional() @IsEnum(TestStatus) status?: TestStatus;
  @IsOptional() @IsBoolean() showScoreImmediately?: boolean;
  @IsOptional() @IsString() accessCode?: string | null;
}

export class CreateTestQuestionDto {
  @IsUUID() testId: string;
  @IsUUID() questionId: string;
  @IsOptional() @IsInt() @Min(0) points?: number;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateTestQuestionDto {
  @IsOptional() @IsInt() @Min(0) points?: number;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class StartTestAttemptDto {
  @IsUUID() testId: string;
  @IsOptional() @IsUUID() assignmentId?: string;
}

export class SubmitTestAnswerDto {
  @IsUUID() questionId: string;
  @IsOptional() answer?: Record<string, unknown> | null;
}

export class SubmitTestAttemptDto {
  @IsInt() @Min(0) durationSeconds: number;
}

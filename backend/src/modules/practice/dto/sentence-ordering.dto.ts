import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

/**
 * POST /practice/sentence-ordering/start
 * Body: { lessonId?, levelId?, count?, idempotencyKey? }
 *
 * Không cần truyền questionData — service sẽ tự lấy từ DB.
 */
export class StartSentenceOrderingDto {
  @IsOptional() @IsUUID() lessonId?: string | null;
  @IsOptional() @IsUUID() levelId?: string | null;
  @IsOptional() @IsUUID() topicId?: string | null;
  @IsOptional() @IsInt() @Min(1) questionCount?: number;
  @IsOptional() @IsString() idempotencyKey?: string | null;
}

/**
 * POST /practice/sentence-ordering/:attemptId/submit
 * Body: answers + durationSeconds.
 *
 * PR-10 §3.5: Backend so sánh token ID, không tin kết quả từ frontend.
 */
export class SubmitSentenceOrderingDto {
  @IsArray()
  answers!: SentenceAnswerDto[];
  @IsInt() @Min(0) durationSeconds!: number;
}

export class SentenceAnswerDto {
  @IsUUID() questionId!: string;
  @IsArray() @IsUUID('4', { each: true }) tokenIds!: string[];
}

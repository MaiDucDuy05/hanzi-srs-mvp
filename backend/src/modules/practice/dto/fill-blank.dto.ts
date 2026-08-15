import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class StartFillBlankDto {
  @IsOptional() @IsUUID() lessonId?: string | null;
  @IsOptional() @IsUUID() levelId?: string | null;
  @IsOptional() @IsUUID() topicId?: string | null;
  @IsOptional() @IsInt() @Min(1) questionCount?: number;
  @IsOptional() @IsString() idempotencyKey?: string | null;
}

export class FillBlankAnswerDto {
  @IsString() questionId!: string;
  @IsString() tokenId!: string;
}

export class SubmitFillBlankDto {
  @IsArray() answers!: FillBlankAnswerDto[];
  @IsInt() @Min(0) durationSeconds!: number;
}

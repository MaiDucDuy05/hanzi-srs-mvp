import { IsArray, IsInt, IsOptional, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * POST /practice/hanzi-writing/start
 * Body: { levelId?, lessonId?, topicId? }
 */
export class StartHanziWritingDto {
  @IsOptional() @IsUUID() levelId?: string | null;
  @IsOptional() @IsUUID() lessonId?: string | null;
  @IsOptional() @IsUUID() topicId?: string | null;

  @IsOptional() @IsArray() @IsString({ each: true })
  chars?: string[];
}

/**
 * Kết quả của một chữ Hán trong phiên luyện viết.
 */
export class HanziCharResultDto {
  @IsString() char!: string;
  /** Số lần sai khi viết chữ này. */
  @IsInt() @Min(0) mistakes!: number;
  /** true = user bỏ qua chữ này. */
  skipped!: boolean;
}

/**
 * POST /practice/hanzi-writing/:attemptId/complete
 */
export class CompleteHanziWritingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HanziCharResultDto)
  characters!: HanziCharResultDto[];

  @IsInt() @Min(0) durationSeconds!: number;
}

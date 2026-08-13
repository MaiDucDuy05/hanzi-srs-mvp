import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';

/** SRS rating buttons trên flashcard. */
export enum SrsRating {
  AGAIN = 'AGAIN',   // rating 0 — forgot
  HARD  = 'HARD',    // rating 3 — recalled with difficulty
  GOOD  = 'GOOD',    // rating 4 — recalled correctly
  EASY  = 'EASY',    // rating 5 — trivial
}

export class SubmitReviewDto {
  @IsUUID()
  vocabularyId: string;

  @IsEnum(SrsRating)
  rating: SrsRating;
}

export class ProgressQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() lessonId?: string;
  @IsOptional() @IsUUID() levelId?: string;
  @IsOptional() @IsUUID() topicId?: string;
}

export class UserVocabProgressDto {
  vocabularyId: string;
  masteryLevel: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
}

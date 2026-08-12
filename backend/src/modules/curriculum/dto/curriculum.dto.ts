import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../common/pagination.dto';

// ── Query DTOs ──

export class VocabularyQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() levelId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() search?: string;
}

export class GrammarPointQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() levelId?: string;
  @IsOptional() @IsString() status?: string;
}

export class LessonQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() levelId?: string;
  @IsOptional() @IsString() status?: string;
}

export class LessonContentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() lessonId?: string;
}

export class TopicQueryDto extends PaginationQueryDto {
  @IsOptional() @IsString() status?: string;
}

export class TopicVocabularyQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() topicId?: string;
}

// ── Create/Update DTOs ──

export class CreateHskLevelDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateHskLevelDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CreateVocabularyDto {
  @IsUUID()
  levelId: string;

  @IsString()
  hanzi: string;

  @IsString()
  pinyin: string;

  @IsString()
  meaningVi: string;

  @IsOptional()
  @IsString()
  audioKey?: string | null;

  @IsOptional()
  @IsString()
  partOfSpeech?: string | null;

  @IsOptional()
  @IsString()
  example?: string | null;
}

export class UpdateVocabularyDto {
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  hanzi?: string;

  @IsOptional()
  @IsString()
  pinyin?: string;

  @IsOptional()
  @IsString()
  meaningVi?: string;

  @IsOptional()
  @IsString()
  audioKey?: string | null;

  @IsOptional()
  @IsString()
  partOfSpeech?: string | null;

  @IsOptional()
  @IsString()
  example?: string | null;
}

export class CreateGrammarPointDto {
  @IsUUID()
  levelId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  structure?: string | null;

  @IsOptional()
  @IsString()
  explanation?: string | null;
}

export class UpdateGrammarPointDto {
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  structure?: string | null;

  @IsOptional()
  @IsString()
  explanation?: string | null;
}

export class CreateLessonDto {
  @IsUUID()
  levelId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateLessonDto {
  @IsOptional()
  @IsUUID()
  levelId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CreateLessonContentDto {
  @IsUUID()
  lessonId: string;

  @IsString()
  contentType: string;

  @IsUUID()
  contentId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateLessonContentDto {
  @IsOptional()
  @IsUUID()
  lessonId?: string;

  @IsOptional()
  @IsString()
  contentType?: string;

  @IsOptional()
  @IsUUID()
  contentId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CreateTopicDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  thumbnailKey?: string | null;

  @IsOptional()
  @IsUUID()
  recommendedLevelId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateTopicDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsString()
  thumbnailKey?: string | null;

  @IsOptional()
  @IsUUID()
  recommendedLevelId?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class CreateTopicVocabularyDto {
  @IsUUID()
  topicId: string;

  @IsUUID()
  vocabularyId: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

export class UpdateTopicVocabularyDto {
  @IsOptional()
  @IsUUID()
  topicId?: string;

  @IsOptional()
  @IsUUID()
  vocabularyId?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}

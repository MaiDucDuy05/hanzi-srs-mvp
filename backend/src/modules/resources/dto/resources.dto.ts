import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import {
  ResourceTier,
  AiJobType,
  ContactStatus,
  SpeakingStatus,
} from '../../../common/enums/resources.enums';
import { PaginationQueryDto } from '../../../common/pagination.dto';

// ── Query DTOs ──

export class ResourceQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(ResourceTier) tier?: ResourceTier;
  @IsOptional() @IsString() status?: string;
}

export class AiJobQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsString() status?: string;
}

export class ContactRequestQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(ContactStatus) status?: ContactStatus;
}

export class MistakeBookQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsString() sourceType?: string;
  @IsOptional() @IsString() sourceId?: string;
  /** Filter entries created on or after this ISO timestamp (e.g. 7 days ago for "recent"). */
  @IsOptional() @IsDateString() since?: string;
}

export class SpeakingAttemptQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() userId?: string;
  @IsOptional() @IsEnum(SpeakingStatus) status?: SpeakingStatus;
}


// ── Create/Update DTOs ──

export class CreateResourceDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string | null;
  @IsString() fileKey: string;
  @IsOptional() @IsString() coverImageKey?: string | null;
  @IsEnum(ResourceTier) tier: ResourceTier;
  @IsOptional() @IsUUID() uploaderId?: string;
}

export class UpdateResourceDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() fileKey?: string;
  @IsOptional() @IsString() coverImageKey?: string | null;
  @IsOptional() @IsEnum(ResourceTier) tier?: ResourceTier;
  @IsOptional() @IsString() status?: string;
}

export class CreateAiJobDto {
  @IsUUID() userId: string;
  @IsEnum(AiJobType) jobType: AiJobType;
  inputData: Record<string, unknown>;
}

export class CreateContactRequestDto {
  @IsString() name: string;
  @IsEmail() email: string;
  @IsOptional() @IsString() phone?: string | null;
  @IsString() message: string;
}

export class UpdateContactRequestDto {
  @IsOptional() @IsEnum(ContactStatus) status?: ContactStatus;
}

export class ReplyContactDto {
  @IsString() replyMessage: string;
}

export class CreateMistakeBookDto {
  @IsUUID() userId: string;
  @IsString() sourceType: string;
  @IsString() sourceId: string;
  @IsString() questionType: string;
  questionSnapshot: Record<string, unknown>;
  @IsOptional() userAnswer?: Record<string, unknown> | null;
  @IsOptional() correctAnswer?: Record<string, unknown> | null;
  @IsOptional() @IsString() explanation?: string | null;
}

export class CreateSpeakingAttemptDto {
  @IsString() audioKey: string;
}

export class GradeSpeakingDto {
  @IsOptional() score?: number | null;
  @IsOptional() @IsString() feedback?: string | null;
}


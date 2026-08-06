import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ResourceTier, AiJobType, UpgradeRequestStatus, ContactStatus, SpeakingStatus } from '../../../common/enums/resources.enums';

export class CreateResourceDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string | null;
  @IsString() fileKey: string;
  @IsEnum(ResourceTier) tier: ResourceTier;
  @IsUUID() uploaderId: string;
}

export class UpdateResourceDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() fileKey?: string;
  @IsOptional() @IsEnum(ResourceTier) tier?: ResourceTier;
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
  @IsUUID() userId: string;
  @IsString() audioKey: string;
}

export class GradeSpeakingDto {
  @IsOptional() score?: number | null;
  @IsOptional() @IsString() feedback?: string | null;
}

export class CreateVipUpgradeRequestDto {
  @IsUUID() userId: string;
  @IsOptional() @IsString() note?: string | null;
}

export class ReviewVipUpgradeDto {
  @IsEnum(UpgradeRequestStatus) status: UpgradeRequestStatus;
  @IsOptional() @IsString() note?: string | null;
}

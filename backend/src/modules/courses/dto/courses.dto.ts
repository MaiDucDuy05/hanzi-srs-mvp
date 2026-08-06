import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Audience } from '../../../common/enums/curriculum.enums';
import { PaginationQueryDto } from '../../../common/pagination.dto';

// ── Query DTOs ──

export class CourseQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(Audience) audience?: Audience;
  @IsOptional() @IsString() status?: string;
}

export class CourseLessonQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() courseId?: string;
}

// ── Create/Update DTOs ──

export class CreateCourseDto {
  @IsString() name: string;
  @IsString() slug: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() thumbnailKey?: string | null;
  @IsEnum(Audience) audience: Audience;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateCourseDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsString() thumbnailKey?: string | null;
  @IsOptional() @IsEnum(Audience) audience?: Audience;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class CreateCourseLessonDto {
  @IsUUID() courseId: string;
  @IsUUID() lessonId: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

export class UpdateCourseLessonDto {
  @IsOptional() @IsUUID() courseId?: string;
  @IsOptional() @IsUUID() lessonId?: string;
  @IsOptional() @IsInt() @Min(0) displayOrder?: number;
}

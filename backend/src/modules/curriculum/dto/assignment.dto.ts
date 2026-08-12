import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/pagination.dto';
import { AssignmentStatus } from '../entities/assignment.entity';

export class AssignmentQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID() assignedTo?: string;
  @IsOptional() @IsUUID() assignedBy?: string;
  @IsOptional() @IsEnum(AssignmentStatus) status?: AssignmentStatus;
}

export class CreateAssignmentDto {
  @IsString() title: string;
  @IsOptional() @IsString() description?: string | null;
  @IsUUID() assignedBy: string;
  @IsUUID() assignedTo: string;
  @IsOptional() @IsDateString() dueDate?: string | null;
  @IsOptional() @IsUUID() vocabularyId?: string;
}

export class UpdateAssignmentDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string | null;
  @IsOptional() @IsDateString() dueDate?: string | null;
  @IsOptional() @IsEnum(AssignmentStatus) status?: AssignmentStatus;
}

import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTestAssignmentDto {
  @IsUUID() testId: string;
  @IsOptional() @IsString() classroomId?: string | null;
  @IsOptional() @IsUUID("4", { each: true }) studentIds?: string[];
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}

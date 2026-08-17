import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTestAssignmentDto {
  @IsUUID() testId: string;
  @IsOptional() @IsString() classroomId?: string | null;
  @IsOptional() @IsUUID() studentId?: string | null;
  @IsDateString() startTime: string;
  @IsDateString() endTime: string;
}

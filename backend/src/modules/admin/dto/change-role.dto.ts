import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Role } from '../../../common/enums/user.enums';

export class ChangeRoleDto {
  @IsString()
  role: string;

  @IsOptional()
  @IsInt()
  vipDays?: number;
}

import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAdminUserDto {
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @IsNotEmpty({ message: 'Email không được để trống' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  fullName: string;

  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Mật khẩu phải từ 6 ký tự trở lên' })
  password?: string;

  // Hỗ trợ truyền role 'VIP' hoặc các Role chuẩn
  @IsString()
  @IsNotEmpty({ message: 'Quyền không được để trống' })
  role: string;

  @IsOptional()
  vipDays?: number;
}

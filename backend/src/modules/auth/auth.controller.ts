import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return { data: result, message: 'Registered successfully' };
  }

  @Public()
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return { data: result, message: 'Logged in successfully' };
  }
}

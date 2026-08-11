import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/auth.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from './decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';

@Controller('users')
@Roles(Role.ADMIN)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(Role.ADMIN, Role.TEACHER)
  async findAll(@Query() query: UserQueryDto) {
    const result = await this.userService.findAll(query);
    return { ...result, message: 'Users retrieved successfully' };
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.TEACHER)
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    return { data: user, message: 'User retrieved successfully' };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return { data: user, message: 'User created successfully' };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.userService.update(id, dto);
    return { data: user, message: 'User updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.userService.softDelete(id);
  }
}

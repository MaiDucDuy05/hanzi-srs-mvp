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
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, UpdateUserDto } from './dto/auth.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Roles } from './decorators/roles.decorator';
import { Role, UserStatus } from '../../common/enums/user.enums';
import { CurrentUser } from './decorators/current-user.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import type { JwtPayload } from './strategies/jwt.strategy';

@Controller('users')
@Roles(Role.ADMIN)
@SkipThrottle({ default: true, auth: true })
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
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() current: JwtPayload,
  ) {
    // Users can only update their own profile unless they are ADMIN
    if (current.sub !== id && current.role !== Role.ADMIN) {
      throw new ForbiddenException('Cannot update another user\'s profile');
    }

    // Non-admins cannot change roles or status
    if (current.role !== Role.ADMIN) {
      if (dto.role !== undefined || dto.status !== undefined) {
        throw new ForbiddenException('Only admins can change roles or status');
      }
    }

    const user = await this.userService.update(id, dto);
    return { data: user, message: 'User updated successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() current: JwtPayload) {
    // Users can only delete themselves unless they are ADMIN
    if (current.sub !== id && current.role !== Role.ADMIN) {
      throw new ForbiddenException('Cannot delete another user');
    }
    // Prevent self-deletion of admins
    if (current.sub === id && current.role === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot delete themselves');
    }
    await this.userService.softDelete(id);
  }
}

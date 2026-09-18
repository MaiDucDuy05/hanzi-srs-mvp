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
import { ResourceTypeService } from './resource-type.service';
import {
  CreateResourceTypeDto,
  UpdateResourceTypeDto,
} from './dto/resource-type.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../../common/enums/user.enums';
import { Public } from '../auth/decorators/public.decorator';

function ok(data: any, msg: string) {
  return { data, message: msg };
}

@Controller('resources/types')
export class ResourceTypeController {
  constructor(private readonly svc: ResourceTypeService) {}

  @Public()
  @Get()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const list = await this.svc.findAll(includeInactive === 'true');
    return ok(list, 'Resource types retrieved');
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return ok(await this.svc.findById(id), 'Resource type retrieved');
  }

  @Post()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateResourceTypeDto) {
    return ok(await this.svc.create(dto), 'Resource type created');
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() dto: UpdateResourceTypeDto) {
    return ok(await this.svc.update(id, dto), 'Resource type updated');
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.svc.softDelete(id);
  }
}

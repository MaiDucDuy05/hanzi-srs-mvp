import { Controller, Get, Post, Delete, Param, Body, Query, HttpCode, HttpStatus, Patch, UseGuards } from '@nestjs/common';
import { MistakeBookService } from './mistake-book.service';
import * as DTO from './dto/resources.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('mistake-book')
@UseGuards(JwtAuthGuard)
export class MistakeBookController {
  constructor(private readonly svc: MistakeBookService) {}
  @Get()
  async findAll(@Query() q: DTO.MistakeBookQueryDto, @CurrentUser() user: any) {
    if (user.role === 'STUDENT') {
      q.userId = user.sub;
    }
    return ok(await this.svc.findAll(q), 'Mistake book entries retrieved');
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const entry = await this.svc.findById(id);
    if (user.role === 'STUDENT' && entry.userId !== user.sub) {
      throw new Error('Not authorized to view this mistake');
    }
    return ok(entry, 'Mistake book entry retrieved');
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: DTO.CreateMistakeBookDto, @CurrentUser('sub') userId: string) {
    dto.userId = userId;
    return ok(await this.svc.create(dto), 'Mistake book entry created');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    const entry = await this.svc.findById(id);
    if (entry.userId !== userId) throw new Error('Not authorized to delete this mistake');
    await this.svc.delete(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: DTO.UpdateMistakeBookDto,
  ) {
    return ok(await this.svc.update(id, userId, dto), 'Mistake book entry updated');
  }

  @Post('review/start')
  async startReview(@CurrentUser('sub') userId: string, @Body('filter') filter?: string) {
    return ok(await this.svc.startReview(userId, filter), 'Mistake review started');
  }

  @Post('review/:id/submit')
  async submitReview(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body('isCorrect') isCorrect: boolean,
  ) {
    return ok(await this.svc.submitReview(id, userId, isCorrect), 'Mistake review submitted');
  }
}

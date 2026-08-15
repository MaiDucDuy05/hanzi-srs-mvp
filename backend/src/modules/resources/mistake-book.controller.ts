import { Controller, Get, Post, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { MistakeBookService } from './mistake-book.service';
import * as DTO from './dto/resources.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('mistake-book')
export class MistakeBookController {
  constructor(private readonly svc: MistakeBookService) {}
  @Get() async findAll(@Query() q: DTO.MistakeBookQueryDto) { return ok(await this.svc.findAll(q), 'Mistake book entries retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Mistake book entry retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: DTO.CreateMistakeBookDto) { return ok(await this.svc.create(dto), 'Mistake book entry created'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }

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

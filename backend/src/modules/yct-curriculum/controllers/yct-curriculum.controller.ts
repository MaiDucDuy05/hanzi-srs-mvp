import { Controller, Get, Param, Query } from '@nestjs/common';
import { YctCurriculumService } from '../services/yct-curriculum.service';
import { YctVocabularyQueryDto } from '../dto/yct-curriculum.dto';
import { Public } from '../../auth/decorators/public.decorator';

@Controller('yct')
@Public()
export class YctCurriculumController {
  constructor(private readonly yctCurriculumService: YctCurriculumService) {}

  @Get('levels')
  async getLevels() {
    const data = await this.yctCurriculumService.getLevels();
    return { data, message: 'Danh sách cấp độ YCT' };
  }

  @Get('levels/:code')
  async getLevelByCode(@Param('code') code: string) {
    const data = await this.yctCurriculumService.getLevelByCode(code);
    return { data, message: `Chi tiết cấp độ ${code.toUpperCase()}` };
  }

  @Get('lessons/:id')
  async getLessonDetail(@Param('id') id: string) {
    const data = await this.yctCurriculumService.getLessonDetail(id);
    return { data, message: 'Chi tiết bài học YCT' };
  }

  @Get('vocabularies')
  async getVocabularies(@Query() query: YctVocabularyQueryDto) {
    const data = await this.yctCurriculumService.getVocabularies(query);
    return { data, message: 'Danh sách từ vựng YCT' };
  }
}

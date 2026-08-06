import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CourseService, CourseLessonService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, CreateCourseLessonDto, UpdateCourseLessonDto, CourseQueryDto, CourseLessonQueryDto } from './dto/courses.dto';

function ok(data: any, msg: string) { return data?.meta ? { ...data, message: msg } : { data, message: msg }; }

@Controller('courses')
export class CourseController {
  constructor(private readonly svc: CourseService) {}
  @Get() async findAll(@Query() q: CourseQueryDto) { return ok(await this.svc.findAll(q), 'Courses retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Course retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateCourseDto) { return ok(await this.svc.create(dto), 'Course created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateCourseDto) { return ok(await this.svc.update(id, dto), 'Course updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.softDelete(id); }
}

@Controller('course-lessons')
export class CourseLessonController {
  constructor(private readonly svc: CourseLessonService) {}
  @Get() async findAll(@Query() q: CourseLessonQueryDto) { return ok(await this.svc.findAll(q), 'Course lessons retrieved'); }
  @Get(':id') async findOne(@Param('id') id: string) { return ok(await this.svc.findById(id), 'Course lesson retrieved'); }
  @Post() @HttpCode(HttpStatus.CREATED) async create(@Body() dto: CreateCourseLessonDto) { return ok(await this.svc.create(dto), 'Course lesson created'); }
  @Patch(':id') async update(@Param('id') id: string, @Body() dto: UpdateCourseLessonDto) { return ok(await this.svc.update(id, dto), 'Course lesson updated'); }
  @Delete(':id') @HttpCode(HttpStatus.NO_CONTENT) async remove(@Param('id') id: string) { await this.svc.delete(id); }
}

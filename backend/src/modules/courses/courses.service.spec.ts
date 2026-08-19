import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CourseService, CourseLessonService } from './courses.service';
import { Course } from './entities/course.entity';
import { CourseLesson } from './entities/course-lesson.entity';

describe('CourseService', () => {
  let service: CourseService;
  let repo: jest.Mocked<Repository<Course>>;

  const mockCourse: Course = {
    id: 'course-1',
    title: 'HSK 1 Course',
    description: 'Beginner Chinese',
    audience: 'BEGINNER',
    status: 'ACTIVE',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      softRemove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: getRepositoryToken(Course), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    repo = module.get(getRepositoryToken(Course));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated courses with default pagination', async () => {
      repo.findAndCount.mockResolvedValue([[mockCourse], 1]);

      const result = await service.findAll({});

      expect(result.data).toEqual([mockCourse]);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should filter by audience', async () => {
      repo.findAndCount.mockResolvedValue([[mockCourse], 1]);

      await service.findAll({ audience: 'BEGINNER' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { audience: 'BEGINNER' },
        }),
      );
    });

    it('should filter by status', async () => {
      repo.findAndCount.mockResolvedValue([[mockCourse], 1]);

      await service.findAll({ status: 'ACTIVE' });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'ACTIVE' },
        }),
      );
    });

    it('should handle custom pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ page: 2, limit: 10 });

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return course when found', async () => {
      repo.findOne.mockResolvedValue(mockCourse);

      const result = await service.findById('course-1');

      expect(result).toEqual(mockCourse);
    });

    it('should throw NotFoundException when course not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent')).rejects.toThrow('Course not found');
    });
  });

  describe('create', () => {
    it('should create and return new course', async () => {
      const createDto = { title: 'New Course', description: 'Test', audience: 'BEGINNER', status: 'ACTIVE', displayOrder: 1 };
      const createdCourse = { ...mockCourse, ...createDto };
      repo.create.mockReturnValue(createdCourse as Course);
      repo.save.mockResolvedValue(createdCourse as Course);

      const result = await service.create(createDto);

      expect(repo.create).toHaveBeenCalledWith(createDto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.title).toBe(createDto.title);
    });
  });

  describe('update', () => {
    it('should update and return course', async () => {
      const updateDto = { title: 'Updated Course' };
      const updatedCourse = { ...mockCourse, ...updateDto };
      repo.findOne.mockResolvedValue(mockCourse);
      repo.save.mockResolvedValue(updatedCourse as Course);

      const result = await service.update('course-1', updateDto);

      expect(result.title).toBe(updateDto.title);
    });
  });

  describe('softDelete', () => {
    it('should soft delete course', async () => {
      repo.findOne.mockResolvedValue(mockCourse);
      repo.softRemove.mockResolvedValue(mockCourse);

      await service.softDelete('course-1');

      expect(repo.softRemove).toHaveBeenCalledWith(mockCourse);
    });

    it('should throw NotFoundException when deleting non-existent course', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.softDelete('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});

describe('CourseLessonService', () => {
  let service: CourseLessonService;
  let repo: jest.Mocked<Repository<CourseLesson>>;

  const mockLesson: CourseLesson = {
    id: 'lesson-1',
    courseId: 'course-1',
    title: 'Lesson 1',
    content: 'Content here',
    displayOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseLessonService,
        { provide: getRepositoryToken(CourseLesson), useValue: mockRepo },
      ],
    }).compile();

    service = module.get<CourseLessonService>(CourseLessonService);
    repo = module.get(getRepositoryToken(CourseLesson));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated lessons filtered by courseId', async () => {
      repo.findAndCount.mockResolvedValue([[mockLesson], 1]);

      const result = await service.findAll({ courseId: 'course-1' });

      expect(result.data).toEqual([mockLesson]);
      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { courseId: 'course-1' },
        }),
      );
    });

    it('should use default pagination', async () => {
      repo.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({});

      expect(repo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
          order: { displayOrder: 'ASC' },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return lesson when found', async () => {
      repo.findOne.mockResolvedValue(mockLesson);

      const result = await service.findById('lesson-1');

      expect(result).toEqual(mockLesson);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return new lesson', async () => {
      const createDto = { courseId: 'course-1', title: 'New Lesson', content: 'Content', displayOrder: 2 };
      repo.create.mockReturnValue({ ...mockLesson, ...createDto } as CourseLesson);
      repo.save.mockResolvedValue({ ...mockLesson, ...createDto } as CourseLesson);

      const result = await service.create(createDto);

      expect(result.title).toBe(createDto.title);
    });
  });

  describe('update', () => {
    it('should update lesson', async () => {
      const updateDto = { title: 'Updated Lesson' };
      const updatedLesson = { ...mockLesson, ...updateDto };
      repo.findOne.mockResolvedValue(mockLesson);
      repo.save.mockResolvedValue(updatedLesson as CourseLesson);

      const result = await service.update('lesson-1', updateDto);

      expect(result.title).toBe(updateDto.title);
    });
  });

  describe('delete', () => {
    it('should permanently delete lesson', async () => {
      repo.findOne.mockResolvedValue(mockLesson);
      repo.remove.mockResolvedValue(mockLesson);

      await service.delete('lesson-1');

      expect(repo.remove).toHaveBeenCalledWith(mockLesson);
    });
  });
});

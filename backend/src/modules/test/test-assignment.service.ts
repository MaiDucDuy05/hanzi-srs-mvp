import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TestAssignment } from './entities/test-assignment.entity';
import { CreateTestAssignmentDto } from './dto/test-assignment.dto';
import { Test } from './entities/test.entity';
import { TestStatus } from '../../common/enums/test.enums';

@Injectable()
export class TestAssignmentService {
  constructor(
    @InjectRepository(TestAssignment) private repo: Repository<TestAssignment>,
    @InjectRepository(Test) private testRepo: Repository<Test>,
  ) {}

  async create(dto: CreateTestAssignmentDto, assignerId: string) {
    if (!dto.classroomId && (!dto.studentIds || dto.studentIds.length === 0)) {
      throw new BadRequestException('Must provide either classroomId or studentIds');
    }

    const assignmentsToCreate = [];

    if (dto.classroomId) {
      assignmentsToCreate.push({
        testId: dto.testId,
        classroomId: dto.classroomId,
        studentId: null,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        assignedBy: assignerId,
        statusOnSubmit: dto.statusOnSubmit || 'GRADED',
      });
    }

    if (dto.studentIds && dto.studentIds.length > 0) {
      for (const studentId of dto.studentIds) {
        assignmentsToCreate.push({
          testId: dto.testId,
          classroomId: null,
          studentId: studentId,
          startTime: new Date(dto.startTime),
          endTime: new Date(dto.endTime),
          assignedBy: assignerId,
          statusOnSubmit: dto.statusOnSubmit || 'GRADED',
        });
      }
    }

    const assignments = this.repo.create(assignmentsToCreate);
    const saved = await this.repo.save(assignments);
    
    // Automatically publish the test so students can actually take it
    await this.testRepo.update(dto.testId, { status: TestStatus.PUBLISHED });
    
    return saved;
  }

  async findAssignedToStudent(studentId: string, classroomIds: string[]) {
    const now = new Date();
    
    // We want to find all assignments for this student directly OR via their classrooms
    const query = this.repo.createQueryBuilder('ta')
      .leftJoinAndSelect('ta.test', 'test')
      .where('(ta.studentId = :studentId OR ta.classroomId IN (:...classroomIds))', { 
        studentId, 
        classroomIds: classroomIds.length ? classroomIds : [null] 
      })
      .orderBy('ta.createdAt', 'DESC');

    return query.getMany();
  }
}

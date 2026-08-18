import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { TestAssignment } from './entities/test-assignment.entity';
import { CreateTestAssignmentDto } from './dto/test-assignment.dto';

@Injectable()
export class TestAssignmentService {
  constructor(
    @InjectRepository(TestAssignment) private repo: Repository<TestAssignment>,
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
        });
      }
    }

    const assignments = this.repo.create(assignmentsToCreate);
    return this.repo.save(assignments);
  }

  async findAssignedToStudent(studentId: string, classroomIds: string[]) {
    const now = new Date();
    
    // We want to find assignments for this student directly OR via their classrooms
    // where now is between startTime and endTime.
    const query = this.repo.createQueryBuilder('ta')
      .leftJoinAndSelect('ta.test', 'test')
      .where('ta.startTime <= :now', { now })
      .andWhere('ta.endTime >= :now', { now })
      .andWhere('(ta.studentId = :studentId OR ta.classroomId IN (:...classroomIds))', { 
        studentId, 
        classroomIds: classroomIds.length > 0 ? classroomIds : [null] 
      })
      .orderBy('ta.endTime', 'ASC');

    return query.getMany();
  }
}

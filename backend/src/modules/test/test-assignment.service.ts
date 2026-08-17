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
    if (!dto.classroomId && !dto.studentId) {
      throw new BadRequestException('Must provide either classroomId or studentId');
    }

    const assignment = this.repo.create({
      testId: dto.testId,
      classroomId: dto.classroomId,
      studentId: dto.studentId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      assignedBy: assignerId,
    });

    return this.repo.save(assignment);
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

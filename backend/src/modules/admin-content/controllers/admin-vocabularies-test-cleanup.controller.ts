import { Controller, Post, Query, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vocabulary } from '../../curriculum/entities/vocabulary.entity';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../../common/enums/user.enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Ip } from '@nestjs/common';
import { AuditLogService } from '../../admin/audit-log.service';

/**
 * Test-only cleanup endpoint cho load test (k6).
 * POST /admin/test-data/cleanup?prefix=loadtest_
 *
 * Xóa mềm tất cả vocab có hanzi bắt đầu bằng prefix. An toàn — chỉ vocab
 * được tạo bởi admin write journey (prefix loadtest_). Chỉ ADMIN.
 *
 * KHÔNG dùng trong production — guard bằng NODE_ENV check.
 * Path đặt riêng (không phải /admin/vocabularies/:id) để tránh bị UUID validator
 * của controller chính chặn.
 */
@Controller('admin/test-data')
@Roles(Role.ADMIN)
export class AdminVocabulariesTestCleanupController {
  constructor(
    @InjectRepository(Vocabulary) private readonly vocabRepo: Repository<Vocabulary>,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  async cleanupByPrefix(
    @Query('prefix') prefix: string,
    @CurrentUser('sub') adminId: string,
    @Ip() ipAddress: string,
  ) {
    if (process.env.NODE_ENV === 'production') {
      throw new BadRequestException('Test cleanup disabled in production');
    }
    if (!prefix || prefix.length < 3) {
      throw new BadRequestException('prefix required, min 3 chars');
    }

    // Find matching vocab (chưa xóa mềm)
    const victims = await this.vocabRepo.find({
      where: { hanzi: { $like: `${prefix}%` } as any, isActive: true },
      take: 1000, // safety limit
    });

    if (victims.length === 0) return { deleted: 0 };

    // Soft-delete hàng loạt
    const now = new Date();
    for (const v of victims) {
      v.isActive = false;
      v.deletedAt = now;
    }
    await this.vocabRepo.save(victims);

    await this.auditLogService.logAction(
      adminId, 'CLEANUP_TEST_VOCAB', 'VOCABULARY', 'BATCH',
      ipAddress,
      { reason: `Cleaned up ${victims.length} test vocabularies with prefix ${prefix}` },
    );

    return { deleted: victims.length };
  }
}
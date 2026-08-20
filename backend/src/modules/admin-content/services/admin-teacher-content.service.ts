import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { AuditLogService } from '../../admin/audit-log.service';

@Injectable()
export class AdminTeacherContentService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAll(params: { search?: string; type?: string; authorId?: string; status?: string; limit?: number; offset?: number }) {
    const { limit = 20, offset = 0, search, type, authorId, status } = params;

    let query = `
      SELECT id, name as title, 'test' as type, teacher_id as author_id, hidden_by_admin as "hiddenByAdmin", hide_reason as "hideReason", hidden_at as "hiddenAt", created_at as "createdAt", deleted_at as "deletedAt"
      FROM tests
      UNION ALL
      SELECT id, title, 'resource' as type, uploader_id as author_id, hidden_by_admin as "hiddenByAdmin", hide_reason as "hideReason", hidden_at as "hiddenAt", created_at as "createdAt", deleted_at as "deletedAt"
      FROM resources
      UNION ALL
      SELECT id, LEFT(COALESCE(content->>'question', content->>'questionText', 'Untitled Question'), 100) as title, 'question' as type, creator_id as author_id, hidden_by_admin as "hiddenByAdmin", hide_reason as "hideReason", hidden_at as "hiddenAt", created_at as "createdAt", CASE WHEN is_active = false THEN created_at ELSE NULL END as "deletedAt"
      FROM questions
    `;

    // A wrapping query to filter
    let wrapperQuery = `SELECT * FROM (${query}) as combined WHERE 1=1`;
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (type) {
      wrapperQuery += ` AND type = $${paramIndex++}`;
      queryParams.push(type);
    }
    if (authorId) {
      wrapperQuery += ` AND author_id = $${paramIndex++}`;
      queryParams.push(authorId);
    }
    if (status === 'HIDDEN') {
      wrapperQuery += ` AND "hiddenByAdmin" = true`;
    } else if (status === 'ACTIVE') {
      wrapperQuery += ` AND "hiddenByAdmin" = false`;
    }
    
    // Add deleted_at is null check for the wrapper
    wrapperQuery += ` AND "deletedAt" IS NULL`;

    if (search) {
      wrapperQuery += ` AND title ILIKE $${paramIndex++}`;
      queryParams.push(`%${search}%`);
    }

    // Count query
    const countQuery = `SELECT COUNT(*) as total FROM (${wrapperQuery}) as filtered`;
    const countResult = await this.dataSource.query(countQuery, queryParams);
    const total = parseInt(countResult[0].total, 10);

    // Order and paginate
    wrapperQuery += ` ORDER BY "createdAt" DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    queryParams.push(limit, offset);

    const items = await this.dataSource.query(wrapperQuery, queryParams);

    return {
      items,
      total,
      limit,
      offset,
    };
  }

  private getTableName(type: string): string {
    switch (type) {
      case 'test': return 'tests';
      case 'resource': return 'resources';
      case 'question': return 'questions';
      default: throw new NotFoundException(`Invalid content type: ${type}`);
    }
  }

  async hideContent(type: string, id: string, reason: string, adminId: string, ipAddress: string) {
    const tableName = this.getTableName(type);
    
    // Verify existence
    const exists = await this.dataSource.query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
    if (!exists.length) {
      throw new NotFoundException(`Content not found`);
    }

    const now = new Date();
    await this.dataSource.query(
      `UPDATE ${tableName} SET hidden_by_admin = true, hide_reason = $1, hidden_at = $2 WHERE id = $3`,
      [reason, now, id]
    );

    await this.auditLogService.logAction(adminId, 'HIDE_TEACHER_CONTENT', type.toUpperCase(), id, ipAddress, { reason });
    return { success: true };
  }

  async unhideContent(type: string, id: string, adminId: string, ipAddress: string) {
    const tableName = this.getTableName(type);
    
    // Verify existence
    const exists = await this.dataSource.query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
    if (!exists.length) {
      throw new NotFoundException(`Content not found`);
    }

    await this.dataSource.query(
      `UPDATE ${tableName} SET hidden_by_admin = false, hide_reason = NULL, hidden_at = NULL WHERE id = $1`,
      [id]
    );

    await this.auditLogService.logAction(adminId, 'UNHIDE_TEACHER_CONTENT', type.toUpperCase(), id, ipAddress);
    return { success: true };
  }

  async findOne(type: string, id: string) {
    const tableName = this.getTableName(type);
    const result = await this.dataSource.query(`SELECT * FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
    if (!result.length) {
      throw new NotFoundException(`Content not found`);
    }
    
    // Add the type back so frontend knows what it is
    const item = result[0];
    item.type = type;
    
    return item;
  }

  async softDelete(type: string, id: string, adminId: string, ipAddress: string) {
    const tableName = this.getTableName(type);
    
    const exists = await this.dataSource.query(`SELECT id FROM ${tableName} WHERE id = $1`, [id]);
    if (!exists.length) {
      throw new NotFoundException(`Content not found`);
    }

    if (tableName === 'questions') {
      await this.dataSource.query(
        `UPDATE ${tableName} SET is_active = false WHERE id = $1`,
        [id]
      );
    } else {
      const now = new Date();
      await this.dataSource.query(
        `UPDATE ${tableName} SET deleted_at = $1 WHERE id = $2`,
        [now, id]
      );
    }

    await this.auditLogService.logAction(adminId, 'DELETE_TEACHER_CONTENT', type.toUpperCase(), id, ipAddress);
    return { success: true };
  }
}

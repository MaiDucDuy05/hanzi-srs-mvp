import { MigrationInterface, QueryRunner } from 'typeorm';

export class AssignmentTable1723512345680 implements MigrationInterface {
  name = 'AssignmentTable1723512345680';

  public async up(qr: QueryRunner): Promise<void> {
    await qr.query(`
      CREATE TABLE assignments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(200) NOT NULL,
        description text,
        assigned_by uuid NOT NULL,
        assigned_to uuid NOT NULL,
        due_date timestamptz,
        vocabulary_count int NOT NULL DEFAULT 0,
        status varchar(20) NOT NULL DEFAULT 'PENDING',
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT fk_assignment_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_assignment_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE INDEX idx_assignments_assigned_to ON assignments(assigned_to);
      CREATE INDEX idx_assignments_assigned_by ON assignments(assigned_by);
      CREATE INDEX idx_assignments_status ON assignments(status);
    `);
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(`DROP TABLE IF EXISTS assignments`);
  }
}

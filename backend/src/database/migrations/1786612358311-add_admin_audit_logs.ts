import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAdminAuditLogs1786612358311 implements MigrationInterface {
    name = 'AddAdminAuditLogs1786612358311'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "admin_id" uuid NOT NULL, "action" character varying(50) NOT NULL, "target_type" character varying(50) NOT NULL, "target_id" uuid NOT NULL, "old_value" jsonb, "new_value" jsonb, "reason" text, "ip_address" character varying(45) NOT NULL, CONSTRAINT "PK_de7a8fc2fbb525484c71a86bb96" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "ban_reason" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "banned_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "banned_by" uuid`);
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "FK_01a78e07962ed72eaf9ccae990b" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "FK_01a78e07962ed72eaf9ccae990b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "banned_by"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "banned_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "ban_reason"`);
        await queryRunner.query(`DROP TABLE "admin_audit_logs"`);
    }
}

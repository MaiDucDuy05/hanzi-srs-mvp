import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateVipUpgradeRequest1786759806084 implements MigrationInterface {
    name = 'UpdateVipUpgradeRequest1786759806084'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" ADD "plan" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" ADD "amount" numeric(10,0) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" ADD "transfer_note" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" DROP COLUMN "transfer_note"`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" DROP COLUMN "plan"`);
    }
}

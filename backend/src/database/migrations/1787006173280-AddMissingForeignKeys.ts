import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingForeignKeys1787006173280 implements MigrationInterface {
    name = 'AddMissingForeignKeys1787006173280'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_attempts" ADD CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "test_questions" ADD CONSTRAINT "FK_5badfac5ec550e555213ad2e5bc" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" ADD CONSTRAINT "FK_47132c418fdbfb54759da8f9aff" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" ADD CONSTRAINT "FK_9ff1f0d068ecd366ef5d9245ae7" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "subscriptions" ADD CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "daily_practice_usage" ADD CONSTRAINT "FK_998540156ef18852f92988c1610" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_78240992f63218b86eb49e7c2e5" FOREIGN KEY ("recommended_level_id") REFERENCES "hsk_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "topic_vocabularies" ADD CONSTRAINT "FK_490493f27735f8749a596d9ed86" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vocabularies" ADD CONSTRAINT "FK_6ba37e90cb27887d8d654b4e5a2" FOREIGN KEY ("level_id") REFERENCES "hsk_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "FK_7cceeefa847caf410e3c79a66af" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" ADD CONSTRAINT "FK_96188b677e634541bf8545cac9e" FOREIGN KEY ("vocabulary_id") REFERENCES "vocabularies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "speaking_attempts" ADD CONSTRAINT "FK_b69556883458c62d7e290598bb4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "speaking_attempts" ADD CONSTRAINT "FK_e345aeb8144885a01e19ab5b51b" FOREIGN KEY ("graded_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "resources" ADD CONSTRAINT "FK_bf650039fa84491f02d72691ea2" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "mistake_book" ADD CONSTRAINT "FK_79452e379d66b323b225a23e7a3" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ai_generation_jobs" ADD CONSTRAINT "FK_fda8358a42ab640f3479ddcc246" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_bef74ccec84ea34dde9ae8b8629" FOREIGN KEY ("level_id") REFERENCES "hsk_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD CONSTRAINT "FK_a54868295e9ba8337cb7f975064" FOREIGN KEY ("level_id") REFERENCES "hsk_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD CONSTRAINT "FK_824afebd218ea53227f8383b521" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_questions" ADD CONSTRAINT "FK_550435d673604aab78aa087ba47" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" ADD CONSTRAINT "FK_49dc54e892aea5903b7d8256b51" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lesson_contents" ADD CONSTRAINT "FK_118fa95e3bfeb4fc10406f72cf1" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_lessons" ADD CONSTRAINT "FK_1bb754da7dd104c4a3beb9677c8" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_lessons" ADD CONSTRAINT "FK_90b56bba59a6dc2d10675e05233" FOREIGN KEY ("lesson_id") REFERENCES "lessons"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "grammar_points" ADD CONSTRAINT "FK_574ab623cb7b95d3bc0231a3920" FOREIGN KEY ("level_id") REFERENCES "hsk_levels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "grammar_points" DROP CONSTRAINT "FK_574ab623cb7b95d3bc0231a3920"`);
        await queryRunner.query(`ALTER TABLE "course_lessons" DROP CONSTRAINT "FK_90b56bba59a6dc2d10675e05233"`);
        await queryRunner.query(`ALTER TABLE "course_lessons" DROP CONSTRAINT "FK_1bb754da7dd104c4a3beb9677c8"`);
        await queryRunner.query(`ALTER TABLE "lesson_contents" DROP CONSTRAINT "FK_118fa95e3bfeb4fc10406f72cf1"`);
        await queryRunner.query(`ALTER TABLE "practice_attempts" DROP CONSTRAINT "FK_49dc54e892aea5903b7d8256b51"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP CONSTRAINT "FK_550435d673604aab78aa087ba47"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP CONSTRAINT "FK_824afebd218ea53227f8383b521"`);
        await queryRunner.query(`ALTER TABLE "practice_questions" DROP CONSTRAINT "FK_a54868295e9ba8337cb7f975064"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_bef74ccec84ea34dde9ae8b8629"`);
        await queryRunner.query(`ALTER TABLE "ai_generation_jobs" DROP CONSTRAINT "FK_fda8358a42ab640f3479ddcc246"`);
        await queryRunner.query(`ALTER TABLE "mistake_book" DROP CONSTRAINT "FK_79452e379d66b323b225a23e7a3"`);
        await queryRunner.query(`ALTER TABLE "resources" DROP CONSTRAINT "FK_bf650039fa84491f02d72691ea2"`);
        await queryRunner.query(`ALTER TABLE "speaking_attempts" DROP CONSTRAINT "FK_e345aeb8144885a01e19ab5b51b"`);
        await queryRunner.query(`ALTER TABLE "speaking_attempts" DROP CONSTRAINT "FK_b69556883458c62d7e290598bb4"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" DROP CONSTRAINT "FK_96188b677e634541bf8545cac9e"`);
        await queryRunner.query(`ALTER TABLE "user_vocabulary_progress" DROP CONSTRAINT "FK_7cceeefa847caf410e3c79a66af"`);
        await queryRunner.query(`ALTER TABLE "vocabularies" DROP CONSTRAINT "FK_6ba37e90cb27887d8d654b4e5a2"`);
        await queryRunner.query(`ALTER TABLE "topic_vocabularies" DROP CONSTRAINT "FK_490493f27735f8749a596d9ed86"`);
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_78240992f63218b86eb49e7c2e5"`);
        await queryRunner.query(`ALTER TABLE "daily_practice_usage" DROP CONSTRAINT "FK_998540156ef18852f92988c1610"`);
        await queryRunner.query(`ALTER TABLE "subscriptions" DROP CONSTRAINT "FK_d0a95ef8a28188364c546eb65c1"`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" DROP CONSTRAINT "FK_9ff1f0d068ecd366ef5d9245ae7"`);
        await queryRunner.query(`ALTER TABLE "vip_upgrade_requests" DROP CONSTRAINT "FK_47132c418fdbfb54759da8f9aff"`);
        await queryRunner.query(`ALTER TABLE "test_questions" DROP CONSTRAINT "FK_5badfac5ec550e555213ad2e5bc"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_193bbf9a4f34822e0aa41fefc92"`);
        await queryRunner.query(`ALTER TABLE "test_attempts" DROP CONSTRAINT "FK_88b08b09eb90ae8d6afb2147b5e"`);
    }

}

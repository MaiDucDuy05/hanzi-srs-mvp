import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [__dirname + "/../**/*.entity.{ts,js}"],
  synchronize: false,
});

/** Cau truc de thi HSK chuan */
const HSK_TEMPLATES = [
  // HSK 1
  { hsk_level: 1, category: "FINAL_EXAM", name: "Thi Cuoi ky / Giua ky - HSK 1", time: 35, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 20, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 20, groups: 0 },
  ]},
  { hsk_level: 1, category: "MID_TERM", name: "Thi Giua ky - HSK 1", time: 35, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 20, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 20, groups: 0 },
  ]},
  { hsk_level: 1, category: "QUIZ_15M", name: "Kiem tra 15 phut - HSK 1", time: 15, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 8, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 8, groups: 0 },
  ]},
  // HSK 2
  { hsk_level: 2, category: "FINAL_EXAM", name: "Thi Cuoi ky / Giua ky - HSK 2", time: 50, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 35, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 25, groups: 1 },
  ]},
  { hsk_level: 2, category: "MID_TERM", name: "Thi Giua ky - HSK 2", time: 50, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 35, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 25, groups: 1 },
  ]},
  { hsk_level: 2, category: "QUIZ_15M", name: "Kiem tra 15 phut - HSK 2", time: 15, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 10, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 8, groups: 0 },
  ]},
  { hsk_level: 2, category: "TEST_1H", name: "Kiem tra 1 Tieng - HSK 2", time: 60, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 35, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 25, groups: 1 },
  ]},
  // HSK 3
  { hsk_level: 3, category: "FINAL_EXAM", name: "Thi Cuoi ky - HSK 3", time: 85, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 40, groups: 3 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 30, groups: 2 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 10, groups: 0 },
  ]},
  { hsk_level: 3, category: "MID_TERM", name: "Thi Giua ky - HSK 3", time: 85, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 40, groups: 3 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 30, groups: 2 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 10, groups: 0 },
  ]},
  { hsk_level: 3, category: "QUIZ_15M", name: "Kiem tra 15 phut - HSK 3", time: 15, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 7, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 6, groups: 0 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 2, groups: 0 },
  ]},
  { hsk_level: 3, category: "TEST_1H", name: "Kiem tra 1 Tieng - HSK 3", time: 60, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 25, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 22, groups: 1 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 8, groups: 0 },
  ]},
  // HSK 4
  { hsk_level: 4, category: "FINAL_EXAM", name: "Thi Cuoi ky - HSK 4", time: 100, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 45, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 40, groups: 5 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 15, groups: 0 },
  ]},
  { hsk_level: 4, category: "MID_TERM", name: "Thi Giua ky - HSK 4", time: 100, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 45, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 40, groups: 5 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 15, groups: 0 },
  ]},
  { hsk_level: 4, category: "QUIZ_15M", name: "Kiem tra 15 phut - HSK 4", time: 15, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 7, groups: 0 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 6, groups: 0 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 2, groups: 0 },
  ]},
  { hsk_level: 4, category: "TEST_1H", name: "Kiem tra 1 Tieng - HSK 4", time: 60, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 27, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 24, groups: 3 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 9, groups: 0 },
  ]},
  // HSK 5
  { hsk_level: 5, category: "FINAL_EXAM", name: "Thi Cuoi ky - HSK 5", time: 120, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 45, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 45, groups: 5 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 10, groups: 0 },
  ]},
  { hsk_level: 5, category: "MID_TERM", name: "Thi Giua ky - HSK 5", time: 120, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 45, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 45, groups: 5 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 10, groups: 0 },
  ]},
  { hsk_level: 5, category: "TEST_1H", name: "Kiem tra 1 Tieng - HSK 5", time: 60, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 22, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 22, groups: 2 },
    { name: "Phan 3: Viet", skill: "WRITING", count: 6, groups: 0 },
  ]},
  // HSK 6
  { hsk_level: 6, category: "FINAL_EXAM", name: "Thi Cuoi ky - HSK 6", time: 135, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 50, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 50, groups: 5 },
    { name: "Phan 3: Viet (Bai luan)", skill: "WRITING", count: 1, groups: 0 },
  ]},
  { hsk_level: 6, category: "MID_TERM", name: "Thi Giua ky - HSK 6", time: 135, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 50, groups: 4 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 50, groups: 5 },
    { name: "Phan 3: Viet (Bai luan)", skill: "WRITING", count: 1, groups: 0 },
  ]},
  { hsk_level: 6, category: "TEST_1H", name: "Kiem tra 1 Tieng - HSK 6", time: 60, sections: [
    { name: "Phan 1: Nghe hieu", skill: "LISTENING", count: 22, groups: 2 },
    { name: "Phan 2: Doc hieu", skill: "READING", count: 22, groups: 2 },
    { name: "Phan 3: Viet (Bai luan ngan)", skill: "WRITING", count: 1, groups: 0 },
  ]},
];

async function seed() {
  await AppDataSource.initialize();
  const runner = AppDataSource.createQueryRunner();

  console.log("Seeding HSK Test Templates...");
  for (const t of HSK_TEMPLATES) {
    // Insert template
    const [tmpl] = await runner.query(
      `INSERT INTO test_templates (category, hsk_level, name, time_limit_minutes, is_system_default, is_public)
       VALUES ($1, $2, $3, $4, true, false)
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [t.category, t.hsk_level, t.name, t.time]
    );
    if (!tmpl) {
      console.log(`  Skipped (already exists): ${t.name}`);
      continue;
    }
    const templateId = tmpl.id;
    // Insert sections
    for (let i = 0; i < t.sections.length; i++) {
      const s = t.sections[i];
      await runner.query(
        `INSERT INTO test_template_sections (template_id, name, order_index, target_skill, question_count, group_count_allowed, points_per_question)
         VALUES ($1, $2, $3, $4, $5, $6, 1)`,
        [templateId, s.name, i + 1, s.skill, s.count, s.groups]
      );
    }
    console.log(`  Created: ${t.name} (${t.sections.length} sections)`);
  }

  await runner.release();
  await AppDataSource.destroy();
  console.log("Done!");
}

seed().catch((err) => { console.error(err); process.exit(1); });

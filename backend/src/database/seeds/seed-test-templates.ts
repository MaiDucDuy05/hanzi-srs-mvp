import dataSource from '../data-source';
import { TestTemplate } from '../../modules/test/entities/test-template.entity';
import { TestTemplateSection } from '../../modules/test/entities/test-template-section.entity';
import { HSK_TEMPLATES } from './seed-test-templates-data';
import {
  HSK4_TEMPLATES,
  HSK5_TEMPLATES,
  HSK6_TEMPLATES,
  HSK7_9_TEMPLATES,
} from './seed-test-templates-data-hsk4-9';
import type { TemplateDef } from './seed-test-templates-data';

/**
 * Seed mau de thi HSK theo TestCategory (PR-05 + TestTemplate).
 * Idempotent: upsert theo (category, hsk_level, name). Cau truc bam sat
 * chuan HSK 2.0 (HSK 1-6) dang pho bien hien nay + placeholder HSK 7-9.
 *
 * Chay: npm run seed:templates
 */

const ALL_TEMPLATES: TemplateDef[] = [
  ...HSK_TEMPLATES,
  ...HSK4_TEMPLATES,
  ...HSK5_TEMPLATES,
  ...HSK6_TEMPLATES,
  ...HSK7_9_TEMPLATES,
];

async function upsertTemplate(
  tplRepo: ReturnType<typeof dataSource.getRepository<TestTemplate>>,
  secRepo: ReturnType<typeof dataSource.getRepository<TestTemplateSection>>,
  t: TemplateDef,
): Promise<'created' | 'updated'> {
  const existing = await tplRepo.findOne({
    where: { category: t.category, hskLevel: t.hskLevel, name: t.name } as any,
  });

  let tmpl: TestTemplate;
  if (!existing) {
    tmpl = await tplRepo.save(
      tplRepo.create({
        category: t.category,
        hskLevel: t.hskLevel,
        name: t.name,
        description: t.description,
        timeLimitMinutes: t.timeLimitMinutes,
        isSystemDefault: true,
        isPublic: false,
        createdBy: null,
      }),
    );
    console.log(`[+] Created: ${t.name}`);
  } else {
    existing.description = t.description;
    existing.timeLimitMinutes = t.timeLimitMinutes;
    tmpl = await tplRepo.save(existing);
    console.log(`[~] Updated: ${t.name}`);
  }

  // Re-seed sections (idempotent: xoa cu -> insert moi)
  await secRepo.delete({ templateId: tmpl.id } as any);
  for (let i = 0; i < t.sections.length; i++) {
    const s = t.sections[i];
    await secRepo.save(
      secRepo.create({
        templateId: tmpl.id,
        name: s.name,
        orderIndex: i + 1,
        targetSkill: s.skill,
        questionCount: s.count,
        groupCountAllowed: s.groups ?? 0,
        pointsPerQuestion: s.points ?? 1,
      }),
    );
  }

  return existing ? 'updated' : 'created';
}

async function run(): Promise<void> {
  await dataSource.initialize();
  console.log('Connected to database');

  const tplRepo = dataSource.getRepository(TestTemplate);
  const secRepo = dataSource.getRepository(TestTemplateSection);

  let created = 0;
  let updated = 0;

  for (const t of ALL_TEMPLATES) {
    try {
      const result = await upsertTemplate(tplRepo, secRepo, t);
      if (result === 'created') created++;
      else updated++;
    } catch (err) {
      console.error(`[!] Failed: ${t.name}`, err);
      throw err;
    }
  }

  console.log(`\n✅ seed-test-templates done: ${created} created, ${updated} updated, ${ALL_TEMPLATES.length} total`);
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('❌ seed-test-templates failed:', err);
  process.exit(1);
});
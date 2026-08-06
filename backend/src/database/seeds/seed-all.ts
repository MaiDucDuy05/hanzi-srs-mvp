/**
 * Chạy toàn bộ seed theo đúng thứ tự phụ thuộc FK:
 *   1) hsk-levels + settings (seed gốc có sẵn)
 *   2) users → subscriptions
 *   3) curriculum (lessons + vocab + grammar + lesson_contents)
 *   4) topics → topic_vocabularies
 *   5) courses → course_lessons
 *   6) practice-questions (tham chiếu level/lesson)
 *   7) tests → test_questions (tham chiếu teacherId)
 */
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';

const SCRIPTS = [
  ['seed-hsk-levels.ts',         '(hsk levels + practice settings)'],
  ['seed-users.ts',              '(users + subscriptions)'],
  ['seed-curriculum.ts',         '(lessons, vocab, grammar, lesson_contents)'],
  ['seed-topics.ts',             '(topics + topic_vocabularies)'],
  ['seed-courses.ts',            '(courses + course_lessons)'],
  ['seed-practice-questions.ts', '(practice_questions)'],
  ['seed-tests.ts',              '(tests + test_questions)'],
];

const TS_NODE_EXEC = process.execPath; // chạy ts-node/esm-register qua tsx hoặc node --loader
// Sử dụng: npx tsx <script.ts> (nếu có) hoặc fallback node --require ts-node/register
const RUNNER_CMD = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const SEEDS_DIR = __dirname;

function runOne(file: string): boolean {
  const full = path.join(SEEDS_DIR, file);
  console.log(`\n▶▶▶  Running: ${file}  ◀◀◀`);
  const res = spawnSync(RUNNER_CMD, ['tsx', full], {
    stdio: 'inherit',
    cwd: path.resolve(SEEDS_DIR, '..', '..', '..'), // project root (backend folder)
    shell: process.platform === 'win32',
    env: process.env,
  });
  return res.status === 0;
}

let failed = 0;
for (const [file, label] of SCRIPTS) {
  console.log(`\n━━━ ${file} ${label} ━━━`);
  const ok = runOne(file);
  if (!ok) { failed++; console.error(`❌ ${file} EXITED WITH NON-ZERO CODE — tiếp tục seed sau!`); }
}

console.log('\n');
if (failed === 0) { console.log('🎉 TẤT CẢ SEED HOÀN THÀNH!'); process.exit(0); }
else { console.log(`⚠ Seed xong, có ${failed} script lỗi — xem log ở trên.`); process.exit(1); }
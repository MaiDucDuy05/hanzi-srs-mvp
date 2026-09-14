/**
 * Sao chép TOÀN BỘ dữ liệu nét chữ (hanzi-writer-data / MakeMeAHanzi) từ node_modules
 * vào frontend/public/hanzi-data/ để tải runtime qua fetch phục vụ hanzi-writer.
 *
 * Chạy: node scripts/copy-hanzi-data.mjs
 */
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'node_modules', 'hanzi-writer-data');
const DEST = join(ROOT, 'public', 'hanzi-data');

if (!existsSync(SRC)) {
  console.error(`Thư mục nguồn không tồn tại: ${SRC}. Vui lòng chạy npm install trước.`);
  process.exit(1);
}

mkdirSync(DEST, { recursive: true });

console.log(`Bắt đầu đồng bộ dữ liệu nét chữ từ: ${SRC} -> ${DEST}...`);

const files = readdirSync(SRC);
let copied = 0;
let skipped = 0;

for (const file of files) {
  // Copy toàn bộ file JSON dữ liệu chữ và file license bản quyền Arphic
  if (file.endsWith('.json') && file !== 'package.json') {
    copyFileSync(join(SRC, file), join(DEST, file));
    copied += 1;
  } else if (file === 'ARPHICPL.TXT' || file === 'LICENSE') {
    copyFileSync(join(SRC, file), join(DEST, file));
    copied += 1;
  } else {
    skipped += 1;
  }
}

console.log(`Đã sao chép hoàn tất ${copied} files dữ liệu nét chữ vào ${DEST}. (Bỏ qua ${skipped} files phụ trợ)`);


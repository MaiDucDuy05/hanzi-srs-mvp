const fs = require('fs');
const file = 'src/database/migrations/1787006173280-AddMissingForeignKeys.ts';
let content = fs.readFileSync(file, 'utf8');

const upLines = [];
const downLines = [];

const lines = content.split('\n');
let inUp = false;
let inDown = false;

const newLines = [];
for (let line of lines) {
  if (line.includes('public async up(queryRunner: QueryRunner): Promise<void> {')) {
    inUp = true;
    newLines.push(line);
    continue;
  }
  if (line.includes('public async down(queryRunner: QueryRunner): Promise<void> {')) {
    inDown = true;
    newLines.push(line);
    continue;
  }
  
  if (inUp) {
    if (line.includes('}')) {
      inUp = false;
      newLines.push(line);
    } else if (line.includes('FOREIGN KEY')) {
      newLines.push(line);
    }
  } else if (inDown) {
    if (line.includes('}')) {
      inDown = false;
      newLines.push(line);
    } else if (line.includes('DROP CONSTRAINT "FK_') || (line.includes('DROP CONSTRAINT') && line.includes('_fkey'))) {
      newLines.push(line);
    }
  } else {
    newLines.push(line);
  }
}

fs.writeFileSync(file, newLines.join('\n'));

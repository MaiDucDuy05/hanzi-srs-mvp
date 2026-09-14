const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const localeDir = path.join(appDir, '[locale]');

try { fs.mkdirSync(localeDir); } catch(e) {}

const items = fs.readdirSync(appDir);
for (const item of items) {
  if (item === '[locale]' || item === '[locale' || item === 'favicon.ico' || item === 'globals.css') continue;
  fs.renameSync(path.join(appDir, item), path.join(localeDir, item));
}

console.log('Moved files successfully');

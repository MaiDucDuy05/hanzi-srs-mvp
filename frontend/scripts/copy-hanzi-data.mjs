/**
 * Sao chép dữ liệu nét chữ (hanzi-writer-data) từ node_modules vào
 * frontend/public/hanzi-data/ để tải runtime qua fetch (PR-13).
 * Chỉ copy các ký tự trong danh sách curated để giữ dung lượng nhỏ.
 *
 * Chạy: node scripts/copy-hanzi-data.mjs
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'node_modules', 'hanzi-writer-data');
const DEST = join(ROOT, 'public', 'hanzi-data');

/** Các ký tự thường gặp (HSK 1–3 + chữ số) có sẵn trong hanzi-writer-data. */
const CHARS = [
  // Số & chỉ định
  '一','二','三','四','五','六','七','八','九','十','百','千','万',
  // Đại từ & người
  '我','你','他','她','它','们','人','名','家','爸','妈','男','女','孩','朋','友','生','老','师','学','先',
  // Thời gian
  '今','天','明','昨','年','月','日','星','期','时','间','早','晚','午','点','分',
  // Hành động thường dùng
  '是','不','好','有','看','听','说','读','写','做','去','来','吃','喝','买','卖','开','关','走','坐','站','爱','想','知','道','要','能','会','可','以','用','找','给','让','打','问','回答','帮助','谢谢','再见','请','对不起','没','关','系',
  // Nơi chốn & phương hướng
  '中','国','上','下','前','后','左','右','东','西','南','北','里','外','学','校','医','院','银','行','公','园','饭','店','商','店','车','站','机','场','路','街','家','城','市',
  // Tính từ
  '大','小','多','少','高','矮','长','短','快','慢','新','旧','贵','便','宜','漂','亮','美','丽','热','冷','忙','累','饿','渴','对','错','真','假','白','黑','红','绿','蓝','黄','清','楚','干','净',
  // Vật dụng & thiên nhiên
  '水','火','山','河','海','风','雨','雪','天','地','花','草','树','木','猫','狗','鸟','鱼','马','牛','羊','鸡','鸭','果','菜','米','面','茶','咖','啡','牛','奶','蛋','肉','饭','包','书','笔','纸','桌','椅','门','窗','房','屋','电','视','电','话','手','机','电','脑','钱','票','衣','服','鞋','帽','眼','睛','口','鼻','耳','手','脚','头','脸','身','体','心','血','骨','皮','毛','发',
].filter((c, i, arr) => arr.indexOf(c) === i);

mkdirSync(DEST, { recursive: true });

let copied = 0;
let missing = 0;
for (const char of CHARS) {
  const src = join(SRC, `${char}.json`);
  if (!existsSync(src)) {
    missing += 1;
    continue;
  }
  copyFileSync(src, join(DEST, `${char}.json`));
  copied += 1;
}

console.log(`Copied ${copied} char files, ${missing} missing.`);

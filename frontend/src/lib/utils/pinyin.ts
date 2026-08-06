/**
 * Chuẩn hoá pinyin để so khớp (PR-11):
 * - chữ thường, bỏ khoảng trắng thừa
 * - bỏ dấu thanh (ā→a, ǖ→v...)
 * - chấp nhận v / u: cho ü
 */

const TONE_MAP: Record<string, string> = {
  ā: 'a', á: 'a', ǎ: 'a', à: 'a',
  ē: 'e', é: 'e', ě: 'e', è: 'e',
  ī: 'i', í: 'i', ǐ: 'i', ì: 'i',
  ō: 'o', ó: 'o', ǒ: 'o', ò: 'o',
  ū: 'u', ú: 'u', ǔ: 'u', ù: 'u',
  ǖ: 'v', ǘ: 'v', ǚ: 'v', ǜ: 'v', ü: 'v', 'ü:': 'v',
  Ā: 'a', Á: 'a', Ǎ: 'a', À: 'a',
  Ē: 'e', É: 'e', Ě: 'e', È: 'e',
  Ī: 'i', Í: 'i', Ǐ: 'i', Ì: 'i',
  Ō: 'o', Ó: 'o', Ǒ: 'o', Ò: 'o',
  Ū: 'u', Ú: 'u', Ǔ: 'u', Ù: 'u',
  Ǖ: 'v', Ǘ: 'v', Ǚ: 'v', Ǜ: 'v', Ü: 'v',
};

export function normalizePinyin(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      // Ký pháp "ü:" (viết sau n/l, ví dụ nǚ = nü:) phải xử lý trước khi tách
      // từng ký tự, vì "ü:" gồm 2 ký tự. "u:" là dạng ASCII tương đương.
      .replace(/ü:/g, 'v')
      .replace(/u:/g, 'v')
      .split('')
      .map((ch) => TONE_MAP[ch] ?? ch)
      .join('')
      .replace(/\s+/g, '')
  );
}

/** So khớp pinyin người dùng nhập với pinyin mục tiêu. */
export function pinyinMatches(typed: string, target: string): boolean {
  return normalizePinyin(typed) === normalizePinyin(target);
}

export function normalizePinyin(pinyin: string): string {
  let normalized = pinyin.toLowerCase();
  
  // Replace 'ü' and its tone variants with 'v', which is the standard keystroke for it.
  normalized = normalized.replace(/[üǖǘǚǜ]/g, 'v');
  
  return normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritics
    .replace(/\s+/g, '') // Remove spaces
    .replace(/[^a-z]/g, ''); // Keep only basic english letters
}

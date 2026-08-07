/**
 * Tải dữ liệu nét chữ (hanzi-writer-data) từ public/hanzi-data
 * đã được sao chép bởi scripts/copy-hanzi-data.mjs.
 */
export interface CharData {
  strokes: string[];
  medians: number[][][];
}

const cache = new Map<string, CharData | null>();

/** Tải dữ liệu nét cho một chữ Hán; null nếu chưa có. */
export async function loadCharData(char: string): Promise<CharData | null> {
  if (cache.has(char)) return cache.get(char) ?? null;
  try {
    const res = await fetch(`/hanzi-data/${encodeURIComponent(char)}.json`);
    if (!res.ok) {
      cache.set(char, null);
      return null;
    }
    const data = (await res.json()) as CharData;
    cache.set(char, data);
    return data;
  } catch {
    cache.set(char, null);
    return null;
  }
}

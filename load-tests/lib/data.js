// Random picker + think-time helper cho journey.

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// Think-time giữa step (giây) — mô phỏng user đọc/nghĩ. Tránh burst không thật.
export function think(min = 0.5, max = 2) {
  return randomInt(min * 10, max * 10) / 10;
}

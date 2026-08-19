import type { Mistake } from './types';

// ─────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────

export const HEAT_STYLES = {
  critical: { bg: 'bg-[#fff4f4]', border: 'border-[#ffd5d5]', text: 'text-[#e55353]', bar: 'bg-[#e55353]' },
  warning:  { bg: 'bg-[#fffbeb]', border: 'border-[#fde68a]', text: 'text-yellow-600', bar: 'bg-yellow-400' },
  normal:   { bg: 'bg-[#f0f2f5]', border: 'border-gray-200', text: 'text-gray-500', bar: 'bg-gray-300' },
} as const;

export const CARD_COLORS = [
  { bg: 'bg-[#fff4f4]', border: 'border-[#ffd5d5]', text: 'text-[#e55353]' },
  { bg: 'bg-[#fcfce8]', border: 'border-[#eaf3c5]', text: 'text-[#78993a]' },
  { bg: 'bg-[#f0f2f5]', border: 'border-gray-200', text: 'text-gray-500' },
];

export const ACTIVITY_ICONS: Record<string, string> = {
  LESSON_COMPLETED: '📚',
  PRACTICE_COMPLETED: '🎯',
  PERFECT_BONUS: '⭐',
  COMBO_BONUS: '🔥',
  STREAK_MILESTONE: '🏆',
  MISTAKE_REVIEWED: '📝',
  REDEEMED_REWARD: '🎁',
  REWARD_GRANTED: '🎁',
  LEVEL_UP: '🚀',
};

export const ACTIVITY_LABELS: Record<string, string> = {
  LESSON_COMPLETED: 'Hoàn thành bài học',
  PRACTICE_COMPLETED: 'Hoàn thành luyện tập',
  PERFECT_BONUS: 'Điểm hoàn hảo',
  COMBO_BONUS: 'Combo bonus',
  STREAK_MILESTONE: 'Streak milestone',
  MISTAKE_REVIEWED: 'Ôn lỗi sai',
  REDEEMED_REWARD: 'Đổi thưởng',
  REWARD_GRANTED: 'Nhận thưởng',
  LEVEL_UP: 'Lên cấp',
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

export function getHeatLevel(failCount: number) {
  if (failCount >= 5) return HEAT_STYLES.critical;
  if (failCount >= 3) return HEAT_STYLES.warning;
  return HEAT_STYLES.normal;
}

export function getFailCount(m: Mistake): number {
  return Math.max(1, Number(m.failCount) || 1);
}

export function getMistakeLabel(m: Mistake): string {
  const snap = m.questionSnapshot as { hanzi?: string; pinyin?: string; question?: string } | null;
  if (snap?.hanzi) return snap.pinyin ? `${snap.hanzi} — ${snap.pinyin}` : snap.hanzi;
  if (snap?.question) return String(snap.question).slice(0, 40);
  return m.questionType || '—';
}

export function extractText(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (Array.isArray(val)) return val.map(extractText).join(', ');
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    for (const key of ['text', 'answer', 'hanzi', 'pinyin', 'content', 'selected']) {
      if (obj[key] !== undefined && obj[key] !== null) return String(obj[key]);
    }
    const first = Object.values(obj)[0];
    return first !== undefined ? String(first) : '—';
  }
  return '—';
}

export function getInitials(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].substring(0, 2).toUpperCase();
}

export function clampPct(v: number | string | null | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 0;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Hôm nay';
  if (days === 1) return 'Hôm qua';
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' });
}

export function formatScore(score: number): string {
  return `${Math.round(score)}%`;
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-[#78993a]';
  if (score >= 60) return 'text-yellow-600';
  return 'text-[#e55353]';
}

export function getScoreBg(score: number): string {
  if (score >= 80) return 'bg-[#f0fdf4]';
  if (score >= 60) return 'bg-[#fffbeb]';
  return 'bg-[#fff4f4]';
}

export function sortByFailCount(arr: Mistake[]): Mistake[] {
  return [...arr].sort((a, b) => Number(b.failCount || 0) - Number(a.failCount || 0));
}

export function formatActivityLabel(type: string): string {
  return ACTIVITY_LABELS[type] || type;
}

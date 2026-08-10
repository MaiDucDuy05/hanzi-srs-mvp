/**
 * SpeakingGradingFeature — giáo viên chấm bài nói HSKK (FR-08).
 * Liệt kê các bài nộp SUBMITTED, phát audio, nhập điểm + feedback.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { speakingApi } from '@/lib/api/endpoints';
import type { SpeakingAttempt } from '@/lib/api/types';
import { Button } from '@/features/ui/components/button';
import { Card } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';
import { EmptyState } from '@/features/ui/components/empty-state';
import { ErrorState } from '@/features/ui/components/error-state';

export function SpeakingGradingFeature() {
  const [attempts, setAttempts] = useState<SpeakingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SpeakingAttempt | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await speakingApi.list({ status: 'SUBMITTED' });
      setAttempts(data);
    } catch (err) {
      setError((err as Error).message ?? 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleGraded = useCallback((id: string) => {
    setAttempts((prev) => prev.filter((a) => a.id !== id));
    setSelected((prev) => (prev?.id === id ? null : prev));
  }, []);

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <header>
        <h1 className="text-2xl font-bold">Chấm bài luyện nói HSKK</h1>
        <p className="mt-1 text-sm text-gray-500">
          Phát audio của học viên, nhập điểm và phản hồi.
        </p>
      </header>

      {loading && <PageLoading />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && attempts.length === 0 && (
        <EmptyState
          title="Không có bài chờ chấm"
          description="Tất cả bài luyện nói đã được chấm xong."
        />
      )}
      {!loading && !error && attempts.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
          {/* ── Left: list ── */}
          <div className="space-y-3 lg:col-span-2">
            {attempts.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelected(a)}
                className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                  selected?.id === a.id
                    ? 'border-brand bg-brand/5'
                    : 'border-transparent bg-white shadow-sm hover:border-brand/30'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎤</span>
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(a.submittedAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(a.submittedAt).toLocaleTimeString('vi-VN')}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* ── Right: grading panel ── */}
          <div className="lg:col-span-3">
            {selected ? (
              <GradingPanel attempt={selected} onGraded={handleGraded} />
            ) : (
              <Card className="flex h-48 items-center justify-center text-gray-400">
                Chọn một bài nộp để chấm
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── GradingPanel ─────────────────────────────────────────────────────

interface GradingPanelProps {
  attempt: SpeakingAttempt;
  onGraded: (id: string) => void;
}

function GradingPanel({ attempt, onGraded }: GradingPanelProps) {
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState<string>('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = `/api/audio/${encodeURIComponent(attempt.audioKey)}`;

  const togglePlay = () => {
    const audio = audioRef.current ?? new Audio(audioUrl);
    audioRef.current = audio;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.currentTime = 0;
      void audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      audio.onended = () => setPlaying(false);
    }
  };

  const handleSubmit = async () => {
    const s = parseInt(score, 10);
    if (isNaN(s) || s < 0 || s > 100) {
      setErr('Điểm phải từ 0 đến 100');
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      await speakingApi.grade(attempt.id, { score: s, feedback: feedback.trim() || null });
      onGraded(attempt.id);
    } catch (err) {
      setErr((err as Error).message ?? 'Lưu thất bại');
      setSubmitting(false);
    }
  };

  return (
    <Card className="space-y-5">
      {/* Audio player */}
      <div className="flex items-center gap-3 rounded-xl bg-pale-green/40 p-4">
        <button
          onClick={togglePlay}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-white text-lg transition-colors hover:bg-brand-dark"
          aria-label="Phát audio"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div className="flex-1">
          <p className="text-sm font-medium">Audio học viên</p>
          <p className="text-xs text-gray-400">
            Nộp {new Date(attempt.submittedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Score */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Điểm <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder="0 – 100"
            className="w-28 rounded-lg border border-light-bamboo px-3 py-2 text-center text-xl font-bold focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          <span className="text-sm text-gray-400">/ 100</span>
        </div>
      </div>

      {/* Feedback */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Phản hồi</label>
        <textarea
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Nhập phản hồi cho học viên (không bắt buộc)…"
          className="w-full resize-none rounded-lg border border-light-bamboo px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>

      {/* Error */}
      {err && <p className="rounded-md bg-red-50 p-3 text-sm text-red-600">{err}</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="primary"
          loading={submitting}
          disabled={!score}
          onClick={() => { void handleSubmit(); }}
        >
          Lưu kết quả
        </Button>
      </div>
    </Card>
  );
}

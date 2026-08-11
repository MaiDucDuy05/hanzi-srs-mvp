/**
 * SpeakingHubFeature — trang luyện nói HSKK cho student (FR-08).
 * Hiển thị lịch sử nộp bài + nút mở RecordingModal.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { speakingApi } from '@/lib/api/endpoints';
import { SpeakingAttempt } from '@/lib/api/types';
import { Button } from '@/features/ui/components/button';
import { Card } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';
import { EmptyState } from '@/features/ui/components/empty-state';
import { ErrorState } from '@/features/ui/components/error-state';
import { RecordingModal } from './components/recording-modal';

export function SpeakingHubFeature() {
  const [attempts, setAttempts] = useState<SpeakingAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await speakingApi.list();
      setAttempts(data);
    } catch (err) {
      setError((err as Error).message ?? 'Tải dữ liệu thất bại');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleSubmitted = () => {
    void load();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Luyện nói HSKK</h1>
          <p className="mt-1 text-sm text-gray-500">
            Ghi âm trả lời câu hỏi HSKK và nhận phản hồi từ giáo viên.
          </p>
        </div>
        <Button variant="primary" size="lg" pill onClick={() => setModalOpen(true)}>
          🎤 Luyện nói ngay
        </Button>
      </div>

      {/* ── Stats row ── */}
      {!loading && !error && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <p className="text-3xl font-bold text-brand">{attempts.filter((a) => a.status === 'SUBMITTED').length}</p>
            <p className="text-sm text-gray-500">Chờ chấm</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-brand">{attempts.filter((a) => a.status === 'GRADED').length}</p>
            <p className="text-sm text-gray-500">Đã chấm</p>
          </Card>
          <Card className="text-center">
            <p className="text-3xl font-bold text-brand">{attempts.length}</p>
            <p className="text-sm text-gray-500">Tổng bài</p>
          </Card>
        </div>
      )}

      {/* ── Attempt list ── */}
      {loading && <PageLoading />}
      {error && <ErrorState message={error} onRetry={load} />}
      {!loading && !error && attempts.length === 0 && (
        <EmptyState
          title="Chưa có bài luyện nói"
          description="Nhấn nút 'Luyện nói ngay' để bắt đầu ghi âm."
        />
      )}
      {!loading && !error && attempts.length > 0 && (
        <div className="space-y-3">
          {attempts.map((a) => (
            <AttemptCard key={a.id} attempt={a} />
          ))}
        </div>
      )}

      {/* ── Recording modal ── */}
      <RecordingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={handleSubmitted}
      />
    </div>
  );
}

// ── AttemptCard ──────────────────────────────────────────────────────

function AttemptCard({ attempt }: { attempt: SpeakingAttempt }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioUrl = attempt.audioKey
    ? `/api/audio/${encodeURIComponent(attempt.audioKey)}`
    : null;

  const togglePlay = () => {
    if (!audioUrl) return;
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

  const isGraded = attempt.status === 'GRADED';

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        {/* Play button */}
        <button
          onClick={togglePlay}
          disabled={!audioUrl}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Phát audio"
        >
          {playing ? '⏸' : '▶'}
        </button>
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                isGraded
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isGraded ? '✅ Đã chấm' : '⏳ Chờ chấm'}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Nộp lúc {new Date(attempt.submittedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      {/* Grade result */}
      {isGraded && (
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-brand">{attempt.score}</span>
            <span className="text-sm text-gray-400">/ 100</span>
          </div>
          {attempt.feedback && (
            <p className="max-w-xs text-right text-sm italic text-gray-600">
              {attempt.feedback}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

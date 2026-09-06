/**
 * RecordingModal — ghi âm luyện nói HSKK (FR-08).
 * Dùng MediaRecorder API, hỗ trợ re-record trước khi submit.
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { speakingApi } from '@/lib/api/endpoints';
import { Button } from '@/features/ui/components/button';
import { Modal } from '@/features/ui/components/modal';
import { Spinner } from '@/features/ui/components/spinner';

type Phase = 'idle' | 'recording' | 'recorded' | 'uploading' | 'done';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const MAX_DURATION_S = 120; // 2 minutes

export function RecordingModal({ open, onClose, onSubmitted }: Props) {
  const t = useTranslations('Speaking');
  const [phase, setPhase] = useState<Phase>('idle');
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (!open) return;
    setPhase('idle');
    setDuration(0);
    setAudioUrl(null);
    setPlaying(false);
    setError(null);
    chunksRef.current = [];
  }, [open]);

  // Countdown timer while recording
  useEffect(() => {
    if (phase !== 'recording') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setDuration((d) => {
        if (d >= MAX_DURATION_S - 1) {
          stopRecording();
          return MAX_DURATION_S;
        }
        return d + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => { if (audioUrl) URL.revokeObjectURL(audioUrl); };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setPhase('recorded');
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setDuration(0);
      setPhase('recording');
    } catch {
      setError(t('microphoneError'));
    }
  }, [t]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    const audio = audioElRef.current ?? new Audio(audioUrl!);
    audioElRef.current = audio;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
      audio.onended = () => setPlaying(false);
    }
  }, [audioUrl, playing]);

  const handleSubmit = useCallback(async () => {
    if (!audioUrl) return;
    setPhase('uploading');
    try {
      const blob = await fetch(audioUrl).then((r) => r.blob());
      const audioKey = await speakingApi.uploadAudio(blob);
      await speakingApi.create({ audioKey });
      setPhase('done');
      onSubmitted();
      setTimeout(onClose, 1200);
    } catch (err) {
      setError((err as Error).message ?? t('uploadError'));
      setPhase('recorded');
    }
  }, [audioUrl, onClose, onSubmitted, t]);

  const handleDiscard = useCallback(() => {
    if (audioElRef.current) { audioElRef.current.pause(); audioElRef.current = null; }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setPhase('idle');
    setDuration(0);
    setError(null);
  }, [audioUrl]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <Modal
      open={open}
      onClose={phase !== 'recording' && phase !== 'uploading' ? onClose : () => {}}
      title={t('modalTitle')}
    >
      <div className="flex flex-col items-center gap-6 p-2">

        {/* Waveform / Idle visual */}
        <div className="relative flex h-24 w-full items-center justify-center rounded-xl bg-pale-green/50">
          {phase === 'idle' && (
            <span className="text-gray-400 text-sm">{t('idleHint')}</span>
          )}
          {phase === 'recording' && (
            <div className="flex items-center gap-1">
              {[...Array(12)].map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-4 w-1 rounded-full bg-brand animate-pulse"
                  style={{ animationDelay: `${i * 80}ms`, height: `${Math.random() * 56 + 8}px` }}
                />
              ))}
            </div>
          )}
          {phase === 'recorded' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">🎤</span>
              <span className="text-sm text-gray-500">{t('recordedHint', { time: fmt(duration) })}</span>
            </div>
          )}
          {phase === 'uploading' && (
            <div className="flex flex-col items-center gap-2">
              <Spinner className="h-8 w-8" />
              <span className="text-sm text-gray-500">{t('uploadingHint')}</span>
            </div>
          )}
          {phase === 'done' && (
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-sm text-gray-500">{t('submittedHint')}</span>
            </div>
          )}
        </div>

        {/* Timer */}
        {(phase === 'recording' || phase === 'recorded') && (
          <div className="text-xl font-mono font-bold text-brand">
            {fmt(duration)}
            <span className="text-xs font-normal text-gray-400 ml-1">{t('maxDurationSuffix', { time: fmt(MAX_DURATION_S) })}</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="w-full rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</p>
        )}

        {/* Controls */}
        <div className="flex w-full items-center justify-center gap-4">

          {/* Idle → Start */}
          {phase === 'idle' && (
            <Button variant="primary" size="lg" pill onClick={startRecording}>
              {t('startRecordingButton')}
            </Button>
          )}

          {/* Recording → Stop */}
          {phase === 'recording' && (
            <Button variant="danger" size="lg" pill onClick={stopRecording}>
              {t('stopRecordingButton')}
            </Button>
          )}

          {/* Recorded → Play + Re-record + Submit */}
          {phase === 'recorded' && (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={handlePlayPause}
                aria-label={playing ? t('pauseAria') : t('playAria')}
              >
                {playing ? t('pauseButton') : t('resumeButton')}
              </Button>
              <Button variant="ghost" size="md" onClick={handleDiscard}>
                {t('reRecordButton')}
              </Button>
              <Button variant="primary" size="md" onClick={handleSubmit}>
                {t('submitButton')}
              </Button>
            </>
          )}

          {/* Uploading → disabled */}
          {phase === 'uploading' && (
            <Button variant="primary" size="lg" disabled loading>
              {t('uploadingHint')}
            </Button>
          )}

          {/* Done → auto-closes */}
          {phase === 'done' && (
            <span className="text-sm text-gray-400">{t('doneLabel')}</span>
          )}
        </div>
      </div>
    </Modal>
  );
}

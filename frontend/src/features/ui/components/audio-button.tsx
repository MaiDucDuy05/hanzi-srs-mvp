'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';

// Backend phát audio qua GET /api/v1/audio/:key (AUDIO_STORAGE_DIR); next.config.ts
// rewrite /api/audio/:path* sang backend. Nơi deploy có thể trỏ sang CDN/S3 qua env.
const AUDIO_BASE_URL = process.env.NEXT_PUBLIC_AUDIO_BASE_URL ?? '/api/audio';

/**
 * Nút phát audio (FR-01). Không render khi từ không có audioKey.
 * URL audio do backend cấp; ở MVP lấy theo key mặc định nếu chưa có CDN.
 */
export function AudioButton({
  audioKey,
  src,
  text,
  size = 'md',
  label,
  className,
}: {
  audioKey?: string | null;
  src?: string | null;
  text?: string | null;
  size?: 'sm' | 'md';
  label?: string;
  className?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hookedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const url = src ?? (audioKey ? `${AUDIO_BASE_URL}/${encodeURIComponent(audioKey)}` : null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!url && !text) return null;

  const toggle = () => {
    // If text is provided, prefer TTS
    if (text) {
      if (playing) {
        window.speechSynthesis.cancel();
        setPlaying(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        
        // Try to find a good Chinese voice
        const voices = window.speechSynthesis.getVoices();
        const zhVoice = voices.find(v => v.lang.includes('zh') || v.lang.includes('cmn')) || voices.find(v => v.lang.includes('zh-CN'));
        if (zhVoice) {
          utterance.voice = zhVoice;
        }
        
        utterance.onstart = () => setPlaying(true);
        utterance.onend = () => setPlaying(false);
        utterance.onerror = () => setPlaying(false);
        
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
      return;
    }

    // Fallback to legacy audio player if url exists
    if (url) {
      const audio = audioRef.current ?? new Audio(url);
      audioRef.current = audio;
      if (!hookedRef.current) {
        hookedRef.current = true;
        audio.addEventListener('play', () => setPlaying(true));
        audio.addEventListener('ended', () => setPlaying(false));
        audio.addEventListener('pause', () => setPlaying(false));
        audio.addEventListener('error', () => setPlaying(false));
      }
      if (playing) {
        audio.pause();
      } else {
        audio.currentTime = 0;
        void audio.play().catch(() => setPlaying(false));
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={label ?? 'Nghe phát âm'}
        className={cn(
          'inline-flex shrink-0 items-center justify-center rounded-full bg-brand-light text-brand transition-colors hover:bg-brand hover:text-white',
          size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
          className
        )}
      >
        {playing ? '◼' : '🔊'}
      </button>
    </>
  );
}

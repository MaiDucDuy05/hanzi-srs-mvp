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
  size = 'md',
  label,
}: {
  audioKey?: string | null;
  src?: string | null;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hookedRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  const url = src ?? (audioKey ? `${AUDIO_BASE_URL}/${encodeURIComponent(audioKey)}` : null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  if (!url) return null;

  const toggle = () => {
    const audio = audioRef.current ?? new Audio(url);
    audioRef.current = audio;
    if (!hookedRef.current) {
      hookedRef.current = true;
      audio.addEventListener('play', () => setPlaying(true));
      audio.addEventListener('ended', () => setPlaying(false));
      audio.addEventListener('pause', () => setPlaying(false));
      // Audio chưa có nguồn (404/CDN chưa cấu hình) — không treo trạng thái phát.
      audio.addEventListener('error', () => setPlaying(false));
    }
    if (playing) {
      audio.pause();
    } else {
      // DOM Audio element là đối tượng mutable theo thiết kế — rule immutability
      // của React Compiler đánh nhầm vì element được giữ trong ref.
      // eslint-disable-next-line react-hooks/immutability
      audio.currentTime = 0;
      void audio.play().catch(() => setPlaying(false));
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
        )}
      >
        {playing ? '◼' : '🔊'}
      </button>
    </>
  );
}

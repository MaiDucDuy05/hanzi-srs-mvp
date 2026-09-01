'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { hanziWritingApi } from '@/lib/api/endpoints';
import { SourcePicker, type PickedSource } from '@/features/practice/components/source-picker';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import type { HanziChar } from '@/lib/api/types';
import { AudioButton } from '@/features/ui/components/audio-button';
import { ClickableHanzi } from '@/features/ui/components/clickable-hanzi';

/** PR-13: Chọn nguồn từ vựng để luyện viết chữ Hán. */
export function HanziWritingSelectionFeature() {
  const router = useRouter();
  const t = useTranslations('Practice');
  const searchParams = useSearchParams();
  const [picked, setPicked] = useState<PickedSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewChars, setPreviewChars] = useState<HanziChar[] | null>(null);

  const mode = searchParams.get('mode');
  const id = searchParams.get('lesson');
  const isAutoStart = !!(mode && id);

  useEffect(() => {
    if (isAutoStart) {
      let sourceType: 'LEVEL' | 'LESSON' | 'TOPIC' | null = null;
      if (mode === 'hsk') sourceType = 'LEVEL';
      else if (mode === 'topic') sourceType = 'TOPIC';
      else sourceType = 'LESSON'; // Fallback for assignments/lessons
      
      const source = { sourceType, sourceId: id, label: '' };
      
      // Load preview instead of starting immediately
      setLoading(true);
      hanziWritingApi.preview({
        levelId: source.sourceType === 'LEVEL' ? source.sourceId : undefined,
        lessonId: source.sourceType === 'LESSON' ? source.sourceId : undefined,
        topicId: source.sourceType === 'TOPIC' ? source.sourceId : undefined,
      })
      .then((chars) => {
        setPreviewChars(chars);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : t('errorLoadChars'));
        setLoading(false);
      });
    }
  }, [mode, id, isAutoStart]);

  const startPracticeForSource = async (source: PickedSource, specificChars?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const res = await hanziWritingApi.start({
        levelId: source.sourceType === 'LEVEL' ? source.sourceId : undefined,
        lessonId: source.sourceType === 'LESSON' ? source.sourceId : undefined,
        topicId: source.sourceType === 'TOPIC' ? source.sourceId : undefined,
        chars: specificChars,
      });
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      router.push(`/games/stroke/${res.attemptId}${query}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('errorStart'));
      setLoading(false);
    }
  };

  const handleStartAll = () => {
    if (isAutoStart) {
      let sourceType: 'LEVEL' | 'LESSON' | 'TOPIC' = 'LESSON';
      if (mode === 'hsk') sourceType = 'LEVEL';
      else if (mode === 'topic') sourceType = 'TOPIC';
      startPracticeForSource({ sourceType, sourceId: id!, label: '' });
    } else if (picked) {
      startPracticeForSource(picked);
    }
  };

  const handleStartSingle = (char: string) => {
    if (isAutoStart) {
      let sourceType: 'LEVEL' | 'LESSON' | 'TOPIC' = 'LESSON';
      if (mode === 'hsk') sourceType = 'LEVEL';
      else if (mode === 'topic') sourceType = 'TOPIC';
      startPracticeForSource({ sourceType, sourceId: id!, label: '' }, [char]);
    }
  };

  if (isAutoStart && loading && !previewChars) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <PageLoading label={t('loadingChars')} />
      </div>
    );
  }

  if (isAutoStart && error && !previewChars) {
    return (
      <div className="mx-auto mt-20 max-w-md rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
        <h3 className="mb-2 text-lg font-bold">{t('initError')}</h3>
        <p>{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          {t('goBack')}
        </Button>
      </div>
    );
  }

  if (isAutoStart && previewChars) {
    return (
      <div className="w-full flex flex-col min-h-full py-4 relative">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#3e5c46] font-heading tracking-tight">{t('writingLobby')}</h1>
          <Button 
            onClick={handleStartAll} 
            disabled={loading || previewChars.length === 0}
            className="bg-[#215b3b] hover:bg-[#1a4a2f] text-white font-bold py-3 px-6 rounded-full shadow-md"
          >
            {loading ? <PageLoading label={t('starting')} /> : t('practiceAll')}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {previewChars.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-medium text-xl">{t('noHanzi')}</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {previewChars.map((charData, idx) => (
              <div 
                key={`${charData.char}-${idx}`} 
                className="bg-white rounded-[1.5rem] p-4 shadow-sm border-4 border-transparent hover:border-[#aadd4a] hover:shadow-md transition-all group flex flex-col items-center justify-center relative cursor-pointer"
                onClick={() => !loading && handleStartSingle(charData.char)}
              >
                <ClickableHanzi text={charData.char} charClassName="text-5xl font-['Ma_Shan_Zheng','KaiTi',sans-serif] text-[#2c281e] mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-sm font-bold text-[#5a5038]">{charData.pinyin}</div>
                <div className="text-xs text-gray-500 text-center line-clamp-1">{charData.meaning}</div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                  <AudioButton audioKey={charData.audioKey} text={charData.char} className="w-6 h-6 p-1 text-[#8b7e66]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Fallback UI if not auto-started (Manual Pick is no longer used)
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-800">{t('lessonNotFound')}</h1>
        <p className="text-gray-500">
          {t('lessonNotFoundDesc')}
        </p>
      </div>
      <Button onClick={() => router.push('/dashboard/practice')}>
        {t('goToDashboard')}
      </Button>
    </div>
  );
}

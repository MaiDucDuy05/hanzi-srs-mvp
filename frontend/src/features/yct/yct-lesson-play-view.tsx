'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { yctApi, type YctLesson } from '@/lib/api/endpoints/yct';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { YctFlashcardGame } from './components/yct-flashcard-game';
import { YctMemoryGame } from './components/yct-memory-game';
import { YctMatchGame } from './components/yct-match-game';
import { Spinner } from '@/features/ui/components/spinner';

interface YctLessonPlayViewProps {
  lessonId: string;
}

type GameTab = 'flashcard' | 'memory' | 'match';

const STAGES: { id: GameTab; label: string; icon: string }[] = [
  { id: 'flashcard', label: 'Thẻ Hình Flashcard', icon: '🃏' },
  { id: 'memory', label: 'Lật Thẻ Trí Nhớ', icon: '🧩' },
  { id: 'match', label: 'Nối Từ Nhanh', icon: '🎯' },
];

export function YctLessonPlayView({ lessonId }: YctLessonPlayViewProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<YctLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<GameTab>('flashcard');

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'vi';

  useEffect(() => {
    yctApi.getLessonDetail(lessonId)
      .then((data) => setLesson(data))
      .catch((err) => {
        console.error('Failed to load lesson detail:', err);
        setError('Không tìm thấy bài học này.');
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center items-center">
        <Spinner className="w-10 h-10" />
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg text-center">
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-3xl">
          <p className="font-bold">{error || 'Không tìm thấy bài học'}</p>
        </div>
      </div>
    );
  }

  const vocabs = lesson.vocabularies || [];
  const levelCode = lesson.level?.code?.toLowerCase() || 'yct1';

  const currentStageIndex = STAGES.findIndex((s) => s.id === currentTab);
  const currentStage = STAGES[currentStageIndex] || STAGES[0];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 mt-8 sm:mt-12 overflow-y-auto max-h-[calc(100vh-4.5rem)] custom-scrollbar">
      {/* Header bài học & Điều hướng Chuyển tiếp */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white/80 backdrop-blur-xs p-4 rounded-3xl border border-[#eaf3c5] shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/dashboard/yct/${levelCode}`}
            className="p-2.5 rounded-2xl bg-[#e5f5eb] hover:bg-[#d0eedb] text-[#215b3b] transition-colors shadow-xs shrink-0"
            title="Quay lại danh sách bài học"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-[#e5f5eb] text-[#215b3b] px-2.5 py-0.5 rounded-full border border-[#eaf3c5]">
                {lesson.level?.code || 'YCT'}
              </span>
              <span className="text-xs font-bold text-[#215b3b] flex items-center gap-1">
                <span>{currentStage.icon}</span>
                <span>Phần {currentStageIndex + 1}/3: {currentStage.label}</span>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#11321e] mt-0.5">
              {lesson.title}
            </h1>
          </div>
        </div>

        {/* Các nút điều hướng: Quay lại / Chuyển tiếp */}
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {currentStageIndex > 0 && (
            <button
              onClick={() => setCurrentTab(STAGES[currentStageIndex - 1].id)}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold border border-[#eaf3c5] bg-[#f3f8d7]/40 hover:bg-[#e5f5eb] text-[#215b3b] transition-all active:scale-95 shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại</span>
            </button>
          )}

          {currentStageIndex < STAGES.length - 1 ? (
            <button
              onClick={() => setCurrentTab(STAGES[currentStageIndex + 1].id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#215b3b] hover:bg-[#18452b] text-white transition-all active:scale-95 shadow-sm"
            >
              <span>Chuyển tiếp</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => router.push(`/${locale}/dashboard/yct/${levelCode}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#215b3b] hover:bg-[#18452b] text-white transition-all active:scale-95 shadow-sm"
            >
              <span>Hoàn thành bài học</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Khu vực trò chơi */}
      <div className="bg-white border border-[#eaf3c5] rounded-3xl p-6 sm:p-8 shadow-xs">
        {currentTab === 'flashcard' && (
          <YctFlashcardGame
            vocabularies={vocabs}
            lessonTitle={lesson.title}
            onFinish={() => setCurrentTab('memory')}
          />
        )}

        {currentTab === 'memory' && (
          <YctMemoryGame
            vocabularies={vocabs}
            lessonTitle={lesson.title}
            onFinish={() => setCurrentTab('match')}
          />
        )}

        {currentTab === 'match' && (
          <YctMatchGame
            vocabularies={vocabs}
            lessonTitle={lesson.title}
            onFinish={() => router.push(`/${locale}/dashboard/yct/${levelCode}`)}
          />
        )}
      </div>
    </div>
  );
}

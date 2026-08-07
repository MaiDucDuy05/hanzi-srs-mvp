'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { GrammarPoint, Lesson, Vocabulary } from '@/lib/api/types';
import { AuthGuard } from '@/components/layout/auth-guard';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { AudioButton } from '@/components/ui/audio-button';
import { Button } from '@/components/ui/button';

export default function LessonDetailPage() {
  const { levelCode, lessonId } = useParams<{ levelCode: string; lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [grammar, setGrammar] = useState<GrammarPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const lessonData = await curriculumApi.getLesson(lessonId);
        if (cancelled) return;
        setLesson(lessonData);
        const [vocabList, grammarList] = await Promise.all([
          curriculumApi.listVocabularies({ levelId: lessonData.levelId, status: 'PUBLISHED' }),
          curriculumApi.listGrammar({ levelId: lessonData.levelId, status: 'PUBLISHED' }),
        ]);
        if (cancelled) return;
        setVocabularies(vocabList.slice().sort((a, b) => a.hanzi.localeCompare(b.hanzi)));
        setGrammar(grammarList);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải bài học.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (loading) return <AuthGuard><PageLoading label="Đang tải bài học..." /></AuthGuard>;
  if (error || !lesson)
    return <AuthGuard><ErrorState message={error ?? 'Không tìm thấy bài học.'} onRetry={() => location.reload()} /></AuthGuard>;

  const practiceHref = `/practice?sourceType=LESSON&sourceId=${lesson.id}&type=WORD_MATCHING`;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href={`/learn/${levelCode}`} className="text-sm text-brand hover:underline">
              ← {levelCode}
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="mt-1 text-sm text-gray-500">{lesson.description}</p>
            )}
          </div>
          <Link href={practiceHref}>
            <Button size="sm">Luyện tập bài này</Button>
          </Link>
        </header>

        <section>
          <Card>
            <CardHeader
              title="Từ vựng"
              subtitle={`${vocabularies.length} từ trong cấp độ`}
            />
            <CardBody>
              {vocabularies.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có từ vựng.</p>
              ) : (
                <ul className="divide-y divide-gray-100 ">
                  {vocabularies.map((v) => (
                    <li key={v.id} className="flex items-center gap-3 py-2.5">
                      <span className="hanzi w-12 text-xl font-bold text-brand">{v.hanzi}</span>
                      <span className="w-32 text-sm text-gray-600">{v.pinyin}</span>
                      <span className="flex-1 text-sm">{v.meaningVi}</span>
                      <AudioButton audioKey={v.audioKey} />
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader
              title="Ngữ pháp"
              subtitle={`${grammar.length} điểm ngữ pháp trong cấp độ`}
            />
            <CardBody>
              {grammar.length === 0 ? (
                <p className="text-sm text-gray-500">Chưa có ngữ pháp.</p>
              ) : (
                <ul className="space-y-4">
                  {grammar.map((g) => (
                    <li key={g.id} className="rounded-lg border border-gray-100 p-3 ">
                      <p className="font-semibold">{g.title}</p>
                      <p className="mt-1 text-sm font-medium text-brand">{g.structure}</p>
                      <p className="mt-1 text-sm text-gray-600">{g.explanation}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardBody>
          </Card>
        </section>
      </div>
    </AuthGuard>
  );
}

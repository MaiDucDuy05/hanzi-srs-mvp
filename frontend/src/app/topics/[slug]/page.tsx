'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Topic, Vocabulary } from '@/lib/api/types';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { AudioButton } from '@/features/ui/components/audio-button';
import { Button } from '@/features/ui/components/button';

export default function TopicDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const topics = await curriculumApi.listTopics({ status: 'PUBLISHED' });
        if (cancelled) return;
        const found = topics.find((t) => t.slug === slug);
        if (!found) {
          setError('Không tìm thấy chủ đề này.');
          setLoading(false);
          return;
        }
        setTopic(found);
        const links = await curriculumApi.listTopicVocabularies({ topicId: found.id });
        if (cancelled) return;
        const vocabs = await Promise.all(
          links.map((link) => curriculumApi.getVocabulary(link.vocabularyId)),
        );
        if (cancelled) return;
        setVocabularies(vocabs);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải chủ đề.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) return <AuthGuard><PageLoading label="Đang tải chủ đề..." /></AuthGuard>;
  if (error || !topic)
    return <AuthGuard><ErrorState message={error ?? 'Không tìm thấy chủ đề.'} onRetry={() => location.reload()} /></AuthGuard>;

  return (
    <AuthGuard>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Link href="/topics" className="text-sm text-brand hover:underline">
              ← Tất cả chủ đề
            </Link>
            <h1 className="mt-1 text-2xl font-bold">{topic.name}</h1>
            {topic.description && (
              <p className="mt-1 text-sm text-gray-500">{topic.description}</p>
            )}
          </div>
          <Link
            href={`/practice?sourceType=TOPIC&sourceId=${topic.id}&type=WORD_MATCHING`}
          >
            <Button size="sm">Luyện tập chủ đề</Button>
          </Link>
        </header>

        <Card>
          <CardHeader title="Từ vựng" subtitle={`${vocabularies.length} từ trong chủ đề`} />
          <CardBody>
            {vocabularies.length === 0 ? (
              <p className="text-sm text-gray-500">Chủ đề chưa có từ vựng.</p>
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
      </div>
    </AuthGuard>
  );
}

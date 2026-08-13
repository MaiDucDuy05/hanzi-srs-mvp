'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hanziWritingApi } from '@/lib/api/endpoints';
import { SourcePicker, type PickedSource } from '@/features/practice/components/source-picker';
import { Button } from '@/features/ui/components/button';
import { Card, CardBody } from '@/features/ui/components/card';
import { PageLoading } from '@/features/ui/components/spinner';

/** PR-13: Chọn nguồn từ vựng để luyện viết chữ Hán. */
export function HanziWritingSelectionFeature() {
  const router = useRouter();
  const [picked, setPicked] = useState<PickedSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startPractice = async () => {
    if (!picked) return;
    setLoading(true);
    setError(null);
    try {
      const res = await hanziWritingApi.start({
        levelId: picked.sourceType === 'LEVEL' ? picked.sourceId : undefined,
        lessonId: picked.sourceType === 'LESSON' ? picked.sourceId : undefined,
        topicId: picked.sourceType === 'TOPIC' ? picked.sourceId : undefined,
      });
      router.push(`/practice/hanzi-writing/${res.attemptId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể bắt đầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Luyện viết chữ Hán</h1>
        <p className="mt-1 text-sm text-gray-500">
          Chọn nguồn từ vựng để luyện viết đúng thứ tự nét với Hanzi Writer.
        </p>
      </header>

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-lg font-semibold">1. Chọn nguồn từ vựng</h2>
          <SourcePicker value={picked} onChange={setPicked} />
        </CardBody>
      </Card>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={startPractice} disabled={!picked || loading}>
          {loading ? <PageLoading label="Đang bắt đầu..." /> : 'Bắt đầu luyện viết'}
        </Button>
        {!picked && (
          <p className="text-sm text-gray-400">Vui lòng chọn nguồn từ vựng.</p>
        )}
      </div>
    </div>
  );
}

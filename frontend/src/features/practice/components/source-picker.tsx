'use client';

import { useEffect, useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { HskLevel, SourceType, Topic } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';
import { ErrorState } from '@/features/ui/components/error-state';

export interface PickedSource {
  sourceType: SourceType;
  sourceId: string;
  label: string;
}

/**
 * Bộ chọn nguồn từ vựng dùng chung (cấp HSK / chủ đề)
 * cho các trang luyện tập & trò chơi.
 */
export function SourcePicker({
  value,
  onChange,
}: {
  value: PickedSource | null;
  onChange: (s: PickedSource | null) => void;
}) {
  const [levels, setLevels] = useState<HskLevel[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [sourceKind, setSourceKind] = useState<'LEVEL' | 'TOPIC'>('LEVEL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      curriculumApi.listLevels(),
      curriculumApi.listTopics({ status: 'PUBLISHED' }),
    ])
      .then(([ls, ts]) => {
        setLevels(ls);
        setTopics(ts);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.'));
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={() => location.reload()} />;
  }

  const sources: PickedSource[] =
    sourceKind === 'LEVEL'
      ? levels.map((l) => ({ sourceType: 'LEVEL' as const, sourceId: l.id, label: `${l.code} — ${l.name}` }))
      : topics.map((t) => ({ sourceType: 'TOPIC' as const, sourceId: t.id, label: t.name }));

  return (
    <div>
      <div className="mb-3 flex gap-2">
        {(['LEVEL', 'TOPIC'] as const).map((k) => (
          <button
            key={k}
            onClick={() => {
              setSourceKind(k);
              onChange(null);
            }}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium',
              sourceKind === k
                ? 'bg-brand text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200  ',
            )}
          >
            {k === 'LEVEL' ? 'Theo cấp HSK' : 'Theo chủ đề'}
          </button>
        ))}
      </div>
      <div className="grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {sources.map((s) => (
          <button
            key={`${s.sourceType}-${s.sourceId}`}
            onClick={() => onChange(s)}
            className={cn(
              'rounded-lg border px-4 py-3 text-left text-sm transition-colors',
              value?.sourceId === s.sourceId
                ? 'border-brand bg-brand-light text-brand '
                : 'border-gray-200 bg-white hover:border-brand  ',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}

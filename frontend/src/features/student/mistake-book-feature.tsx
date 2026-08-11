'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { curriculumApi, resourceApi } from '@/lib/api/endpoints';
import type { MistakeBookEntry, Vocabulary } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { Card, CardBody, CardHeader } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Field, Input, Select } from '@/features/ui/components/form';
import { Badge } from '@/features/ui/components/badge';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';

export function MistakeBookFeature() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<MistakeBookEntry[]>([]);
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user) return;
    setLoading(true);
    resourceApi.listMistakes({ userId: user.id })
      .then(setEntries)
      .catch((e) => setError(e instanceof Error ? e.message : 'Lỗi tải sổ tay lỗi sai.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user]);

  useEffect(() => {
    curriculumApi.listVocabularies({ status: 'PUBLISHED' })
      .then(setVocab)
      .catch(() => setVocab([]));
  }, []);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !selectedId) return;
    const v = vocab.find((x) => x.id === selectedId);
    if (!v) return;
    setSaving(true);
    try {
      await resourceApi.createMistake({
        userId: user.id, sourceType: 'LEVEL', sourceId: v.levelId,
        questionType: 'HANZI',
        questionSnapshot: { hanzi: v.hanzi, pinyin: v.pinyin, meaning: v.meaningVi },
        correctAnswer: { hanzi: v.hanzi, pinyin: v.pinyin, meaning: v.meaningVi },
        explanation: note || null,
      });
      setSelectedId('');
      setNote('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Thêm lỗi sai thất bại.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa mục này?')) return;
    try {
      await resourceApi.deleteMistake(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xóa thất bại.');
    }
  };

  const snapshotText = (e: MistakeBookEntry) => {
    const s = e.questionSnapshot as Record<string, unknown>;
    if (s.hanzi) return `${String(s.hanzi)} — ${String(s.pinyin ?? '')} — ${String(s.meaning ?? '')}`;
    return JSON.stringify(e.questionSnapshot);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Sổ tay lỗi sai</h1>
        <p className="mt-1 text-sm text-gray-500">Ghi lại những từ hay nhầm để ôn tập lại sau này.</p>
      </header>

      <Card>
        <CardHeader title="Thêm lỗi sai" subtitle="Chọn từ vựng bạn hay nhầm." />
        <CardBody>
          <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label="Từ vựng">
                <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  <option value="">— Chọn từ —</option>
                  {vocab.map((v) => (
                    <option key={v.id} value={v.id}>{v.hanzi} — {v.pinyin} — {v.meaningVi}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex-1">
              <Field label="Ghi chú">
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tại sao hay nhầm?" />
              </Field>
            </div>
            <Button type="submit" disabled={!selectedId} loading={saving}>Thêm</Button>
          </form>
        </CardBody>
      </Card>

      {loading && <PageLoading label="Đang tải sổ tay..." />}
      {error && <ErrorState message={error} onRetry={load} />}

      {!loading && !error && (
        <div className="space-y-2">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardBody>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{snapshotText(e)}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                      <Badge tone="red">{e.questionType}</Badge>
                      <span>{formatDateTime(e.createdAt)}</span>
                      {e.explanation && <span className="text-gray-600">{e.explanation}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => remove(e.id)}>Xóa</Button>
                </div>
              </CardBody>
            </Card>
          ))}
          {entries.length === 0 && <p className="text-sm text-gray-500">Sổ tay còn trống — thêm từ đầu tiên nhé!</p>}
        </div>
      )}
    </div>
  );
}

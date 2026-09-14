'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useTranslations } from 'next-intl';
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
  const t = useTranslations('MistakeBook');
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
      .catch((e) => setError(e instanceof Error ? e.message : t('loadError')))
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
      setError(err instanceof Error ? err.message : t('addError'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await resourceApi.deleteMistake(id);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'));
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
        <h1 className="font-heading text-4xl font-black text-[#215b3b] mb-6">{t('featureHeading')}</h1>
        <p className="mt-1 text-sm text-gray-500">{t('featureSubheading')}</p>
      </header>

      <Card>
        <CardHeader title={t('addCardTitle')} subtitle={t('addCardSubtitle')} />
        <CardBody>
          <form onSubmit={add} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Field label={t('vocabFieldLabel')}>
                <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                  <option value="">{t('vocabFieldPlaceholder')}</option>
                  {vocab.map((v) => (
                    <option key={v.id} value={v.id}>{v.hanzi} — {v.pinyin} — {v.meaningVi}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="flex-1">
              <Field label={t('noteFieldLabel')}>
                <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('noteFieldPlaceholder')} />
              </Field>
            </div>
            <Button type="submit" disabled={!selectedId} loading={saving}>{t('addButton')}</Button>
          </form>
        </CardBody>
      </Card>

      {loading && <PageLoading label={t('loadingLabel')} />}
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
                  <Button variant="ghost" size="sm" onClick={() => remove(e.id)}>{t('deleteButton')}</Button>
                </div>
              </CardBody>
            </Card>
          ))}
          {entries.length === 0 && <p className="text-sm text-gray-500">{t('emptyList')}</p>}
        </div>
      )}
    </div>
  );
}

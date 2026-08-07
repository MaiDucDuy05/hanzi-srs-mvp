'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { Topic, TopicVocabulary, Vocabulary } from '@/lib/api/types';
import { AdminGuard } from '@/components/layout/admin-guard';
import { EntityManager } from '@/components/admin/entity-manager';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Select } from '@/components/ui/form';
import { PageLoading } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [links, setLinks] = useState<TopicVocabulary[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [selectedVocab, setSelectedVocab] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTopics = () =>
    curriculumApi.listTopics({}).then((ts) => {
      setTopics(ts);
      return ts;
    });

  const loadLinks = (topicId: string) =>
    curriculumApi.listTopicVocabularies({ topicId }).then(setLinks);

  useEffect(() => {
    (async () => {
      try {
        const [ts, vs] = await Promise.all([loadTopics(), curriculumApi.listVocabularies({ status: 'PUBLISHED' })]);
        setTopics(ts);
        setVocab(vs);
        if (ts[0]) {
          setSelectedTopic(ts[0].id);
          loadLinks(ts[0].id);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectTopic = (id: string) => {
    setSelectedTopic(id);
    setLinks([]);
    loadLinks(id);
  };

  const attach = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTopic || !selectedVocab) return;
    try {
      await curriculumApi.createTopicVocabulary({
        topicId: selectedTopic,
        vocabularyId: selectedVocab,
        displayOrder: links.length + 1,
      } as never);
      setSelectedVocab('');
      loadLinks(selectedTopic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gắn từ vựng thất bại.');
    }
  };

  const detach = async (link: TopicVocabulary) => {
    try {
      await curriculumApi.deleteTopicVocabulary(link.id);
      loadLinks(selectedTopic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gỡ từ vựng thất bại.');
    }
  };

  const vocabById = (id: string) => vocab.find((v) => v.id === id);

  return (
    <AdminGuard>
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-bold">Chủ đề</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý chủ đề và gắn từ vựng.</p>
        </header>

        {error && <ErrorState message={error} onRetry={() => location.reload()} />}

        <EntityManager<Topic>
          config={{
            title: 'Danh sách chủ đề',
            fetchList: () => curriculumApi.listTopics({}),
            create: (d) => curriculumApi.createTopic(d as never),
            update: (id, d) => curriculumApi.updateTopic(id, d as never),
            remove: (id) => curriculumApi.deleteTopic(id),
            initialForm: { name: '', slug: '', description: '', displayOrder: '', status: 'DRAFT' },
            fields: [
              { key: 'name', label: 'Tên chủ đề', required: true, placeholder: 'Gia đình' },
              { key: 'slug', label: 'Slug', required: true, placeholder: 'gia-dinh' },
              { key: 'description', label: 'Mô tả' },
              { key: 'displayOrder', label: 'Thứ tự', type: 'number' },
              {
                key: 'status', label: 'Trạng thái', type: 'select',
                options: [{ value: 'DRAFT', label: 'Nháp' }, { value: 'PUBLISHED', label: 'Công khai' }],
              },
            ],
            renderRow: (t) => (
              <button
                className="block text-left text-sm"
                onClick={() => selectTopic(t.id)}
              >
                <span className="font-bold">{t.name}</span>
                <span className="text-gray-500"> — /{t.slug} · {t.status}</span>
                {t.id === selectedTopic && <span className="ml-2 text-brand">← đang chọn</span>}
              </button>
            ),
          }}
        />

        {selectedTopic && (
          <Card>
            <CardHeader
              title="Gắn từ vựng"
              subtitle={topics.find((t) => t.id === selectedTopic)?.name ?? ''}
            />
            <CardBody className="space-y-4">
              <form onSubmit={attach} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <Field label="Từ vựng">
                    <Select value={selectedVocab} onChange={(e) => setSelectedVocab(e.target.value)}>
                      <option value="">— Chọn từ —</option>
                      {vocab.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.hanzi} — {v.pinyin} — {v.meaningVi}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </div>
                <Button type="submit" disabled={!selectedVocab}>Gắn vào chủ đề</Button>
              </form>

              {loading ? (
                <PageLoading label="Đang tải..." />
              ) : (
                <ul className="divide-y divide-gray-100 ">
                  {links.map((l) => {
                    const v = vocabById(l.vocabularyId);
                    return (
                      <li key={l.id} className="flex items-center justify-between py-2 text-sm">
                        <span>
                          <span className="hanzi font-bold text-brand">{v?.hanzi ?? l.vocabularyId}</span>
                          <span className="text-gray-500"> — {v?.pinyin} — {v?.meaningVi}</span>
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => detach(l)}>Gỡ</Button>
                      </li>
                    );
                  })}
                  {links.length === 0 && (
                    <li className="py-3 text-sm text-gray-500">Chủ đề chưa có từ vựng.</li>
                  )}
                </ul>
              )}
            </CardBody>
          </Card>
        )}
      </div>
    </AdminGuard>
  );
}

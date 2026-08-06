'use client';

import { useState } from 'react';
import { curriculumApi } from '@/lib/api/endpoints';
import type { GrammarPoint, HskLevel, Lesson, Vocabulary } from '@/lib/api/types';
import { AdminGuard } from '@/components/layout/admin-guard';
import { EntityManager } from '@/components/admin/entity-manager';
import { Tabs } from '@/components/ui/tabs';
import { useApi } from '@/lib/hooks/use-api';


function useLevelOptions() {
  const { data, loading } = useApi<HskLevel[]>(() => curriculumApi.listLevels(), []);
  const options = (data ?? []).map((l) => ({ value: l.id, label: `${l.code} — ${l.name}` }));
  return { options, loading };
}

export default function AdminCurriculumPage() {
  const [tab, setTab] = useState('levels');
  const { options: levelOptions } = useLevelOptions();

  return (
    <AdminGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Chương trình học</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý cấp độ, bài học, từ vựng, ngữ pháp.</p>
        </header>

        <Tabs
          tabs={[
            { key: 'levels', label: 'Cấp độ' },
            { key: 'lessons', label: 'Bài học' },
            { key: 'vocabulary', label: 'Từ vựng' },
            { key: 'grammar', label: 'Ngữ pháp' },
          ]}
          active={tab}
          onChange={setTab}
        />

        {tab === 'levels' && (
          <EntityManager<HskLevel>
            config={{
              title: 'Cấp độ HSK',
              fetchList: () => curriculumApi.listLevels(),
              create: (d) => curriculumApi.createLevel(d as never),
              remove: (id) => curriculumApi.deleteLevel(id),
              initialForm: { code: '', name: '', displayOrder: '' },
              fields: [
                { key: 'code', label: 'Mã (HSK1)', required: true, placeholder: 'HSK1' },
                { key: 'name', label: 'Tên', required: true, placeholder: 'Cấp độ 1' },
                { key: 'displayOrder', label: 'Thứ tự', type: 'number' },
              ],
              renderRow: (l) => (
                <p className="text-sm">
                  <span className="font-bold">{l.code}</span>
                  <span className="text-gray-500"> — {l.name} · thứ tự {l.displayOrder}</span>
                </p>
              ),
            }}
          />
        )}

        {tab === 'lessons' && (
          <EntityManager<Lesson>
            config={{
              title: 'Bài học',
              fetchList: () => curriculumApi.listLessons({}),
              create: (d) => curriculumApi.createLesson(d as never),
              remove: (id) => curriculumApi.deleteLesson(id),
              initialForm: { title: '', levelId: '', description: '', displayOrder: '', status: 'DRAFT' },
              fields: [
                { key: 'title', label: 'Tiêu đề', required: true, placeholder: 'Bài 1: Chào hỏi' },
                { key: 'levelId', label: 'Cấp độ', type: 'select', required: true, options: levelOptions },
                { key: 'description', label: 'Mô tả' },
                { key: 'displayOrder', label: 'Thứ tự', type: 'number' },
                {
                  key: 'status', label: 'Trạng thái', type: 'select',
                  options: [{ value: 'DRAFT', label: 'Nháp' }, { value: 'PUBLISHED', label: 'Công khai' }],
                },
              ],
              renderRow: (l) => (
                <p className="text-sm">
                  <span className="font-bold">{l.title}</span>
                  <span className="text-gray-500"> — {l.status} · thứ tự {l.displayOrder}</span>
                </p>
              ),
            }}
          />
        )}

        {tab === 'vocabulary' && (
          <EntityManager<Vocabulary>
            config={{
              title: 'Từ vựng',
              fetchList: () => curriculumApi.listVocabularies({}),
              create: (d) => curriculumApi.createVocabulary(d as never),
              remove: (id) => curriculumApi.deleteVocabulary(id),
              initialForm: { hanzi: '', pinyin: '', meaningVi: '', levelId: '', status: 'DRAFT' },
              fields: [
                { key: 'hanzi', label: 'Chữ Hán', required: true, placeholder: '你好' },
                { key: 'pinyin', label: 'Pinyin', required: true, placeholder: 'nǐ hǎo' },
                { key: 'meaningVi', label: 'Nghĩa tiếng Việt', required: true, placeholder: 'Xin chào' },
                { key: 'levelId', label: 'Cấp độ', type: 'select', required: true, options: levelOptions },
                {
                  key: 'status', label: 'Trạng thái', type: 'select',
                  options: [{ value: 'DRAFT', label: 'Nháp' }, { value: 'PUBLISHED', label: 'Công khai' }],
                },
              ],
              renderRow: (v) => (
                <p className="text-sm">
                  <span className="hanzi font-bold text-brand">{v.hanzi}</span>
                  <span className="text-gray-500"> — {v.pinyin} — {v.meaningVi} · {v.status}</span>
                </p>
              ),
            }}
          />
        )}

        {tab === 'grammar' && (
          <EntityManager<GrammarPoint>
            config={{
              title: 'Ngữ pháp',
              fetchList: () => curriculumApi.listGrammar({}),
              create: (d) => curriculumApi.createGrammar(d as never),
              remove: (id) => curriculumApi.deleteGrammar(id),
              initialForm: { title: '', structure: '', explanation: '', levelId: '', status: 'DRAFT' },
              fields: [
                { key: 'title', label: 'Tiêu đề', required: true, placeholder: 'Câu hỏi với 吗' },
                { key: 'structure', label: 'Cấu trúc', required: true, placeholder: 'S + 吗？' },
                { key: 'explanation', label: 'Giải thích', placeholder: 'Dùng để hỏi..."' },
                { key: 'levelId', label: 'Cấp độ', type: 'select', required: true, options: levelOptions },
                {
                  key: 'status', label: 'Trạng thái', type: 'select',
                  options: [{ value: 'DRAFT', label: 'Nháp' }, { value: 'PUBLISHED', label: 'Công khai' }],
                },
              ],
              renderRow: (g) => (
                <p className="text-sm">
                  <span className="font-bold">{g.title}</span>
                  <span className="text-brand"> {g.structure}</span>
                  <span className="text-gray-500"> · {g.status}</span>
                </p>
              ),
            }}
          />
        )}

        {levelOptions.length === 0 && (
          <p className="text-xs text-gray-400">Đang tải cấp độ cho các ô chọn...</p>
        )}
      </div>
    </AdminGuard>
  );
}

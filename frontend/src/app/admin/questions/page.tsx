'use client';

import type { PracticeQuestion } from '@/lib/api/types';
import { practiceApi, curriculumApi } from '@/lib/api/endpoints';
import { AdminGuard } from '@/components/layout/admin-guard';
import { EntityManager } from '@/components/admin/entity-manager';
import { useApi } from '@/lib/hooks/use-api';
import { Badge } from '@/components/ui/badge';

export default function AdminQuestionsPage() {
  const { data: levels } = useApi(() => curriculumApi.listLevels(), []);
  const levelOptions = (levels ?? []).map((l) => ({ value: l.id, label: `${l.code} — ${l.name}` }));

  // Parse các trường JSON về object trước khi gửi lên (dùng chung create/update).
  const parseJson = (d: Record<string, unknown>) => {
    const parsed = { ...d };
    for (const k of ['questionData', 'answerData', 'acceptedAnswers'] as const) {
      const raw = parsed[k];
      if (typeof raw === 'string' && raw.trim()) {
        try {
          parsed[k] = JSON.parse(raw);
        } catch {
          parsed[k] = null;
        }
      } else {
        parsed[k] = null;
      }
    }
    return parsed;
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold">Câu hỏi luyện tập</h1>
          <p className="mt-1 text-sm text-gray-500">
            Biên soạn câu hỏi điền khuyết và sắp xếp câu cho hệ thống luyện tập.
          </p>
        </header>

        <EntityManager<PracticeQuestion>
          config={{
            title: 'Câu hỏi',
            fetchList: () => practiceApi.listQuestions({}),
            create: (d) => practiceApi.createQuestion(parseJson(d) as never),
            update: (id, d) => practiceApi.updateQuestion(id, parseJson(d) as never),
            remove: (id) => practiceApi.deleteQuestion(id),
            initialForm: {
              questionType: 'FILL_BLANK',
              levelId: '',
              prompt: '',
              questionData: '',
              answerData: '',
              answerType: 'TEXT',
              translation: '',
              status: 'PUBLISHED',
            },
            fields: [
              {
                key: 'questionType', label: 'Loại câu hỏi', type: 'select', required: true,
                options: [
                  { value: 'FILL_BLANK', label: 'Điền khuyết' },
                  { value: 'SENTENCE_ORDERING', label: 'Sắp xếp câu' },
                ],
              },
              { key: 'levelId', label: 'Cấp độ', type: 'select', options: levelOptions },
              { key: 'prompt', label: 'Gợi ý / câu dẫn', placeholder: 'Nhập chữ Hán còn thiếu...' },
              { key: 'questionData', label: 'Dữ liệu câu hỏi (JSON)', placeholder: '{"sentence":"我__学生。"}' },
              { key: 'answerData', label: 'Dữ liệu đáp án (JSON)', placeholder: '{"answer":"是"}' },
              {
                key: 'answerType', label: 'Kiểu đáp án', type: 'select',
                options: [
                  { value: 'TEXT', label: 'Chữ' },
                  { value: 'HANZI', label: 'Chữ Hán' },
                  { value: 'PINYIN', label: 'Pinyin' },
                ],
              },
              { key: 'translation', label: 'Dịch nghĩa' },
              {
                key: 'status', label: 'Trạng thái', type: 'select',
                options: [{ value: 'DRAFT', label: 'Nháp' }, { value: 'PUBLISHED', label: 'Công khai' }],
              },
            ],
            renderRow: (q) => (
              <p className="text-sm">
                <Badge tone={q.questionType === 'FILL_BLANK' ? 'blue' : 'amber'}>{q.questionType}</Badge>
                <span className="ml-2 font-medium">{q.prompt ?? q.questionType}</span>
                <span className="text-gray-500"> · {q.status}</span>
              </p>
            ),
          }}
        />
      </div>
    </AdminGuard>
  );
}

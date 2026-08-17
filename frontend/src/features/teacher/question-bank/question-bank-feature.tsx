'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { questionBankApi, type QuestionBankItem } from '@/lib/api/endpoints/question-bank';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Badge } from '@/features/ui/components/badge';
import { useAuth } from '@/lib/auth/auth-context';

import { QuestionPreviewModal } from '../components/QuestionPreviewModal';

export function QuestionBankFeature() {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<QuestionBankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Các state lưu trữ bộ lọc
  const [filterType, setFilterType] = useState<string>('');
  const [filterHsk, setFilterHsk] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterVisibility, setFilterVisibility] = useState<string>('');
  const [search, setSearch] = useState('');

  // State cho Modal
  const [previewQuestion, setPreviewQuestion] = useState<QuestionBankItem | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await questionBankApi.list({
        type: filterType,
        hskLevel: filterHsk ? parseInt(filterHsk) : undefined,
        difficulty: filterDifficulty,
        visibility: filterVisibility,
        search
      });
      
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message || 'Lỗi tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  }, [filterType, filterHsk, filterDifficulty, filterVisibility, search]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const remove = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá câu hỏi này?')) return;
    try {
      await questionBankApi.remove(id);
      fetchQuestions();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xoá câu hỏi');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-gray-500 text-sm">Quản lý và lưu trữ câu hỏi để sử dụng trong các đề kiểm tra.</p>
        </div>
        <Button onClick={() => { setEditingQuestion(null); setIsCreateOpen(true); }}>
          + Thêm câu hỏi
        </Button>
      </div>

      <Card>
        <CardBody className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại câu hỏi</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="SINGLE_CHOICE">Trắc nghiệm</option>
              <option value="FILL_IN">Điền từ</option>
              <option value="ORDERING">Sắp xếp</option>
              <option value="MATCHING">Nối từ</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">HSK Level</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              value={filterHsk} onChange={e => setFilterHsk(e.target.value)}>
              <option value="">Tất cả</option>
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>HSK {n}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Độ khó</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="EASY">Dễ</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="HARD">Khó</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">Quyền riêng tư</label>
            <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-500 focus:ring-brand-500"
              value={filterVisibility} onChange={e => setFilterVisibility(e.target.value)}>
              <option value="">Tất cả</option>
              <option value="PRIVATE">Chỉ mình tôi</option>
              <option value="PUBLIC">Công khai</option>
            </select>
          </div>
        </CardBody>
      </Card>

      {loading && <PageLoading label="Đang tải..." />}
      {/* Hiển thị lỗi */}
      {error && (
        <div className="p-10 text-center bg-red-50 text-red-600 rounded-xl border border-red-200">
          <p className="text-4xl mb-2">⚠️</p>
          <p className="font-medium">Có lỗi xảy ra</p>
          <p className="text-sm mt-1">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchQuestions}>Thử lại</Button>
        </div>
      )}

      {/* Danh sách */}
      {!loading && !error && (
        <div className="space-y-3">
          {questions.map((q) => (
            <Card key={q.id}>
              <CardBody className="flex items-center justify-between gap-4 p-4">
                <div className="flex-1 cursor-pointer hover:bg-gray-50 -ml-2 p-2 rounded transition" onClick={() => setPreviewQuestion(q)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge tone={q.type === 'SINGLE_CHOICE' ? 'blue' : 'gray'}>{q.type}</Badge>
                    <Badge tone={q.difficulty === 'EASY' ? 'green' : q.difficulty === 'HARD' ? 'red' : 'amber'}>{q.difficulty}</Badge>
                    {q.hskLevel && <Badge tone="blue">HSK {q.hskLevel}</Badge>}
                    <Badge tone={q.visibility === 'PUBLIC' ? 'green' : 'gray'}>{q.visibility}</Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {q.type === 'SINGLE_CHOICE' && (q.content as any).questionText}
                    {q.type === 'FILL_IN' && (q.content as any).sentence}
                    {q.type === 'ORDERING' && ((q.content as any).correctOrder || []).map((w: any) => typeof w === 'string' ? w : w.text).join(' / ')}
                    {q.type === 'MATCHING' && 'Nối từ tương ứng'}
                  </div>
                  {q.tags && q.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {q.tags.map(t => <span key={t} className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">#{t}</span>)}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPreviewQuestion(q)}>Xem</Button>
                  {(user?.role === 'ADMIN' || q.creatorId === user?.id) && (
                    <>
                      <Button variant="danger" size="sm" onClick={() => remove(q.id)}>Xóa</Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
          {questions.length === 0 && (
            <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
              Chưa có câu hỏi nào trong ngân hàng phù hợp với bộ lọc.
            </div>
          )}
        </div>
      )}

      {/* Preview Modal */}
      <QuestionPreviewModal
        open={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { resourceApi } from '@/lib/api/endpoints';

interface AdminPracticeQuestionModalProps {
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  hskLevels: any[];
  onClose: () => void;
  onSave: () => void;
}

export const AdminPracticeQuestionModal = ({
  editForm,
  setEditForm,
  hskLevels,
  onClose,
  onSave
}: AdminPracticeQuestionModalProps) => {

  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoadingMetadata(true);
        // Fetch topics
        const topicsRes: any = await adminContentApi.getTopics({ limit: 100 });
        setTopics(topicsRes.data?.items || topicsRes.data || []);

        // Fetch all lessons directly
        const lessonsRes: any = await adminContentApi.getAllLessons({ limit: 1000 });
        const allLessons = lessonsRes.data?.items || lessonsRes.data || [];
        
        // Map to include course name if available
        const enrichedLessons = allLessons.map((l: any) => ({
          ...l,
          courseName: l.level?.title || l.courseName || ''
        }));
        
        setLessons(enrichedLessons);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    fetchMetadata();
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-[#11321e]">
            {editForm.id ? 'Sửa Câu hỏi Luyện tập' : 'Thêm Câu hỏi Luyện tập'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Đề bài (Prompt)</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
              placeholder="Ví dụ: Chọn đáp án đúng..."
              value={editForm.prompt || ''} 
              onChange={(e) => setEditForm({...editForm, prompt: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Question Type</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.questionType || 'FILL_BLANK'} 
                onChange={e => setEditForm({...editForm, questionType: e.target.value})}
              >
                <option value="FILL_BLANK">FILL_BLANK</option>
                <option value="SENTENCE_ORDERING">SENTENCE_ORDERING</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Answer Type</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.answerType || 'TEXT'} 
                onChange={e => setEditForm({...editForm, answerType: e.target.value})}
              >
                <option value="TEXT">TEXT</option>
                <option value="HANZI">HANZI</option>
                <option value="PINYIN">PINYIN</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HSK Level</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.levelId || ''} 
                onChange={e => setEditForm({...editForm, levelId: e.target.value})}
              >
                <option value="">-- Chọn Level --</option>
                {hskLevels.map(level => (
                  <option key={level.id} value={level.id}>{level.name || `HSK ${level.level}`}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bài học (Lesson) (Tùy chọn)</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200 disabled:bg-gray-100"
                value={editForm.lessonId || ''} 
                onChange={e => setEditForm({...editForm, lessonId: e.target.value})}
                disabled={isLoadingMetadata}
              >
                <option value="">-- Chọn bài học --</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>
                    {l.courseName ? `[${l.courseName}] ` : ''}{l.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chủ đề (Topic) (Tùy chọn)</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200 disabled:bg-gray-100"
                value={editForm.topicId || ''} 
                onChange={e => setEditForm({...editForm, topicId: e.target.value})}
                disabled={isLoadingMetadata}
              >
                <option value="">-- Chọn chủ đề --</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {editForm.questionType === 'FILL_BLANK' && (
            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-600 p-1 rounded-md">📝</span> 
                Cấu hình Điền từ (Fill Blank)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Các đáp án lựa chọn (ngăn cách bằng dấu phẩy hoặc chấm phẩy)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: 你好,谢谢,再见,好 hoặc A;B;C"
                    value={editForm.questionData?._rawChoices ?? editForm.questionData?.choices?.join(';') ?? ''} 
                    onChange={e => {
                      const raw = e.target.value;
                      const choices = raw.split(/[,;]/).map(s => s.trim()).filter(s => s);
                      setEditForm({
                        ...editForm, 
                        questionData: { 
                          ...editForm.questionData, 
                          choices, 
                          _rawChoices: raw,
                          withHanzi: editForm.questionData?.withHanzi ?? true 
                        }
                      });
                    }} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án đúng</label>
                  <select 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white"
                    value={
                      editForm.answerData?.answer || 
                      (Array.isArray(editForm.acceptedAnswers?.list) ? editForm.acceptedAnswers.list[0] : '') || 
                      ''
                    }
                    onChange={e => {
                      const ans = e.target.value;
                      const idx = editForm.questionData?.choices?.indexOf(ans) ?? 0;
                      setEditForm({
                        ...editForm,
                        answerData: { ...editForm.answerData, answer: ans, blankIndex: idx >= 0 ? idx : 0 },
                        acceptedAnswers: { list: [ans] }
                      });
                    }}
                  >
                    <option value="">-- Chọn đáp án đúng --</option>
                    {(editForm.questionData?.choices || []).map((c: string, i: number) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="withHanzi"
                  className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                  checked={editForm.questionData?.withHanzi ?? true} 
                  onChange={e => setEditForm({
                    ...editForm, 
                    questionData: { ...editForm.questionData, withHanzi: e.target.checked }
                  })} 
                />
                <label htmlFor="withHanzi" className="text-sm font-semibold text-gray-700 cursor-pointer">Hiển thị chữ Hán</label>
              </div>
            </div>
          )}

          {editForm.questionType === 'SENTENCE_ORDERING' && (
            <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100 space-y-4">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-600 p-1 rounded-md">🧩</span> 
                Cấu hình Sắp xếp câu (Sentence Ordering)
              </h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Các từ tạo thành câu đúng (ngăn cách bằng dấu phẩy hoặc khoảng trắng)</label>
                <input 
                  type="text" 
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                  placeholder="VD: 我,喜,欢,喝,茶 hoặc 我 喜 欢 喝 茶"
                  value={(() => {
                    if (editForm.questionData?._rawTokens !== undefined) return editForm.questionData._rawTokens;
                    const tokens = editForm.questionData?.tokens || [];
                    const correctIds = editForm.answerData?.orderedTokenIds || [];
                    if (tokens.length === 0) return '';
                    // Reconstruct from orderedTokenIds
                    const orderedTexts = correctIds.map((id: string) => tokens.find((t: any) => t.id === id)?.text || '');
                    return orderedTexts.join(',');
                  })()} 
                  onChange={e => {
                    const rawText = e.target.value;
                    const words = rawText.includes(',') 
                      ? rawText.split(',').map(s => s.trim()).filter(s => s)
                      : rawText.split(/\s+/).map(s => s.trim()).filter(s => s);
                    
                    const tokens = words.map((w, i) => ({ id: `t${i + 1}`, text: w }));
                    const orderedTokenIds = tokens.map(t => t.id);

                    setEditForm({
                      ...editForm, 
                      questionData: { ...editForm.questionData, tokens, _rawTokens: rawText },
                      answerData: { ...editForm.answerData, orderedTokenIds },
                      acceptedAnswers: { list: orderedTokenIds }
                    });
                  }} 
                />
                <p className="text-xs text-gray-500 mt-2">Hệ thống sẽ tự động tách từ và xáo trộn khi học viên làm bài.</p>
              </div>

              {editForm.questionData?.tokens?.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Kết quả (Xem trước)</label>
                  <div className="flex flex-wrap gap-2">
                    {editForm.questionData.tokens.map((t: any) => (
                      <span key={t.id} className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700">
                        {t.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dịch nghĩa (Tùy chọn)</label>
              <textarea 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none border-gray-200 bg-white" 
                placeholder="VD: Xin chào, bạn khỏe không?"
                rows={2}
                value={editForm.translation || ''} 
                onChange={e => setEditForm({...editForm, translation: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Giải thích (Tùy chọn)</label>
              <textarea 
                className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none border-gray-200 bg-white" 
                placeholder="VD: Dùng để chào hỏi..."
                rows={2}
                value={editForm.explanation || ''} 
                onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="isActive"
              className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
              checked={editForm.isActive ?? true} 
              onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
            />
            <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">Kích hoạt</label>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onSave}
            className="px-6 py-2 rounded-xl font-bold bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] shadow-sm transition-colors"
          >
            Lưu Câu hỏi
          </button>
        </div>
      </div>
    </div>
  );
};

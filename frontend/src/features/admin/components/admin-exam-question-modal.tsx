/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { resourceApi } from '@/lib/api/endpoints';

interface AdminExamQuestionModalProps {
  editForm: any;
  setEditForm: React.Dispatch<React.SetStateAction<any>>;
  onClose: () => void;
  onSave: () => void;
}

export const AdminExamQuestionModal = ({
  editForm,
  setEditForm,
  onClose,
  onSave
}: AdminExamQuestionModalProps) => {

  const [topics, setTopics] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'image') setIsUploadingImage(true);
    else setIsUploadingAudio(true);

    try {
      const ext = file.name.split('.').pop() || '';
      const uniqueName = `exam-question-${type}-${Date.now()}.${ext}`;
      const { uploadUrl, key } = await resourceApi.requestUploadUrl({ fileName: uniqueName, contentType: file.type });
      
      const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!uploadRes.ok) throw new Error('Không thể tải file lên S3');
      
      const publicUrl = `/api/v1/resources/public/${key}`;
      
      setContentField(type === 'image' ? 'mediaUrl' : 'audioUrl', publicUrl);
    } catch (error) {
      console.error('Lỗi upload file:', error);
      alert('Upload file thất bại');
    } finally {
      if (type === 'image') setIsUploadingImage(false);
      else setIsUploadingAudio(false);
    }
  };

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

  // Helpers to safely update the content object
  const setContentField = (field: string, value: any) => {
    setEditForm((prev: any) => ({
      ...prev,
      content: {
        ...(prev.content || {}),
        [field]: value
      }
    }));
  };

  const content = editForm.content || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-[#11321e]">
            {editForm.id ? 'Sửa Câu hỏi' : 'Thêm Câu hỏi Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Row 1: Type & Source & Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nguồn câu hỏi</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.sourceType || 'EXAM'} 
                onChange={e => setEditForm({...editForm, sourceType: e.target.value})}
              >
                {/* <option value="PRACTICE">Luyện tập (Practice)</option> */}
                <option value="EXAM">Bài thi (Exam)</option>
                {/* <option value="BOTH">Cả hai (Both)</option> */}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Loại Câu hỏi</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.type || 'SINGLE_CHOICE'} 
                onChange={e => {
                  setEditForm({
                    ...editForm, 
                    type: e.target.value,
                    // Optionally reset content when type changes
                    content: {}
                  });
                }}
              >
                <option value="SINGLE_CHOICE">Trắc nghiệm một lựa chọn (SINGLE_CHOICE)</option>
                <option value="FILL_IN">Điền vào chỗ trống (FILL_IN)</option>
                <option value="ORDERING">Sắp xếp câu (ORDERING)</option>
                <option value="TRUE_FALSE">Đúng / Sai (TRUE_FALSE)</option>
                <option value="MATCHING">Nối từ (MATCHING)</option>
                <option value="SHORT_ANSWER">Trả lời ngắn (SHORT_ANSWER)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Độ khó</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.difficulty || 'MEDIUM'} 
                onChange={e => setEditForm({...editForm, difficulty: e.target.value})}
              >
                <option value="EASY">Dễ (Easy)</option>
                <option value="MEDIUM">Trung bình (Medium)</option>
                <option value="HARD">Khó (Hard)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Curriculum bindings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">HSK Level</label>
              <select 
                className="w-full border p-2.5 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white border-gray-200"
                value={editForm.hskLevel || ''} 
                onChange={e => setEditForm({...editForm, hskLevel: e.target.value})}
              >
                <option value="">-- Không xếp loại --</option>
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>HSK {num}</option>
                ))}
              </select>
            </div>
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

          {/* Row 3: Media Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hình ảnh minh họa (Tùy chọn)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                  placeholder="URL hình ảnh hoặc tải lên..."
                  value={content.mediaUrl || ''} 
                  onChange={(e) => setContentField('mediaUrl', e.target.value)} 
                />
                <label className={`cursor-pointer px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 flex items-center justify-center min-w-[100px] ${isUploadingImage ? 'opacity-50' : ''}`}>
                  {isUploadingImage ? 'Đang tải...' : 'Tải lên'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'image')} disabled={isUploadingImage} />
                </label>
              </div>
              {content.mediaUrl && (
                <div className="mt-2 relative inline-block">
                  <img src={content.mediaUrl} alt="Preview" className="h-20 rounded-lg border object-cover" />
                  <button type="button" onClick={() => setContentField('mediaUrl', null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">File Audio (Tùy chọn)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                  placeholder="URL audio hoặc tải lên..."
                  value={content.audioUrl || ''} 
                  onChange={(e) => setContentField('audioUrl', e.target.value)} 
                />
                <label className={`cursor-pointer px-4 py-2 bg-gray-100 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-200 flex items-center justify-center min-w-[100px] ${isUploadingAudio ? 'opacity-50' : ''}`}>
                  {isUploadingAudio ? 'Đang tải...' : 'Tải lên'}
                  <input type="file" accept="audio/*" className="hidden" onChange={(e) => handleFileUpload(e, 'audio')} disabled={isUploadingAudio} />
                </label>
              </div>
              {content.audioUrl && (
                <div className="mt-2 flex items-center gap-2">
                  <audio controls src={content.audioUrl} className="h-8 max-w-[200px]" />
                  <button type="button" onClick={() => setContentField('audioUrl', null)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Xóa</button>
                </div>
              )}
            </div>
          </div>

          {/* Dynamic Content Section based on Type */}
          <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4">
            <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-4">
              Nội dung Câu hỏi
            </h3>

            {/* SINGLE_CHOICE or FILL_IN */}
            {(editForm.type === 'SINGLE_CHOICE' || editForm.type === 'FILL_IN' || !editForm.type) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Câu hỏi (Prompt)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Chọn từ đúng điền vào chỗ trống..."
                    value={content.question || content.questionText || ''} 
                    onChange={e => setContentField('question', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Các lựa chọn (cách nhau bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: A, B, C, D"
                    value={(() => {
                      if (content._rawOptions !== undefined) return content._rawOptions;
                      if (Array.isArray(content.options)) return content.options.join(', ');
                      return '';
                    })()} 
                    onChange={e => {
                      const raw = e.target.value;
                      const options = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                      setEditForm((prev: any) => ({
                        ...prev,
                        content: {
                          ...(prev.content || {}),
                          options,
                          _rawOptions: raw
                        }
                      }));
                    }} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án đúng</label>
                  <select 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white"
                    value={
                      (editForm.type === 'FILL_IN' 
                        ? (content.acceptedAnswers?.[0] || (Array.isArray(content.answer) ? content.answer[0] : content.answer) || '')
                        : (content.correctAnswer || content.correct_answer || content.answer || ''))
                    }
                    onChange={e => {
                      if (editForm.type === 'FILL_IN') {
                        setContentField('acceptedAnswers', [e.target.value]);
                      } else {
                        setContentField('correctAnswer', e.target.value);
                      }
                    }}
                  >
                    <option value="">-- Chọn đáp án đúng --</option>
                    {(content.options || []).map((c: string, i: number) => (
                      <option key={i} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ORDERING */}
            {editForm.type === 'ORDERING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Câu hỏi / Yêu cầu</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Sắp xếp các từ sau thành câu hoàn chỉnh"
                    value={content.question || content.questionText || ''} 
                    onChange={e => setContentField('question', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án (Thứ tự đúng, cách nhau bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Tôi, đi, học hoặc Tôi đi học"
                    value={(() => {
                      if (content._rawAnswer !== undefined) return content._rawAnswer;
                      if (Array.isArray(content.correctOrder)) return content.correctOrder.join(', ');
                      if (Array.isArray(content.answer)) return content.answer.join(', ');
                      return '';
                    })()} 
                    onChange={e => {
                      const raw = e.target.value;
                      const answerArray = raw.includes(',') 
                        ? raw.split(/[,;]/).map(s => s.trim()).filter(Boolean)
                        : raw.split(/\s+/).map(s => s.trim()).filter(Boolean);
                      setEditForm((prev: any) => ({
                        ...prev,
                        content: {
                          ...(prev.content || {}),
                          correctOrder: answerArray,
                          _rawAnswer: raw
                        }
                      }));
                    }} 
                  />
                </div>
              </div>
            )}

            {/* TRUE_FALSE */}
            {editForm.type === 'TRUE_FALSE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Câu nhận định</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Tiếng Trung có 4 thanh điệu cơ bản."
                    value={content.question || content.questionText || ''} 
                    onChange={e => setContentField('question', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án</label>
                  <select 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white"
                    value={String(content.correctAnswer ?? content.correct_answer ?? content.answer ?? '')}
                    onChange={e => {
                      const val = e.target.value;
                      setContentField('correctAnswer', val === 'true' ? true : val === 'false' ? false : val);
                    }}
                  >
                    <option value="">-- Chọn đáp án --</option>
                    <option value="true">Đúng (True)</option>
                    <option value="false">Sai (False)</option>
                  </select>
                </div>
              </div>
            )}

            {/* MATCHING */}
            {editForm.type === 'MATCHING' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Câu hỏi / Yêu cầu</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Nối từ tiếng Trung với nghĩa tiếng Việt tương ứng"
                    value={content.question || content.questionText || ''} 
                    onChange={e => setContentField('question', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Các cặp từ (Định dạng: Trái = Phải, cách nhau bởi dấu chấm phẩy)</label>
                  <textarea 
                    className="w-full p-4 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white h-24" 
                    placeholder="VD: 好 = Tốt; 人 = Người; 大 = Lớn"
                    value={(() => {
                      if (content._rawPairs !== undefined) return content._rawPairs;
                      if (Array.isArray(content.pairs)) {
                        return content.pairs.map((p: any) => `${p.left} = ${p.right}`).join('; ');
                      }
                      return '';
                    })()} 
                    onChange={e => {
                      const raw = e.target.value;
                      const pairStrings = raw.split(';').map(s => s.trim()).filter(Boolean);
                      const pairs = pairStrings.map(p => {
                        const [left, right] = p.split('=').map(s => s.trim());
                        return { left: left || '', right: right || '' };
                      });
                      setEditForm((prev: any) => ({
                        ...prev,
                        content: {
                          ...(prev.content || {}),
                          pairs,
                          _rawPairs: raw
                        }
                      }));
                    }} 
                  />
                </div>
              </div>
            )}

            {/* SHORT_ANSWER */}
            {editForm.type === 'SHORT_ANSWER' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Câu hỏi</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Bạn tên là gì?"
                    value={content.question || content.questionText || ''} 
                    onChange={e => setContentField('question', e.target.value)} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Đáp án gợi ý / chấp nhận (cách nhau bởi dấu phẩy)</label>
                  <input 
                    type="text" 
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35] bg-white" 
                    placeholder="VD: Tôi tên là..., Tên tôi là..."
                    value={(() => {
                      if (content._rawAccepted !== undefined) return content._rawAccepted;
                      if (Array.isArray(content.acceptedAnswers)) return content.acceptedAnswers.join(', ');
                      return '';
                    })()} 
                    onChange={e => {
                      const raw = e.target.value;
                      const acceptedAnswers = raw.split(/[,;]/).map(s => s.trim()).filter(Boolean);
                      setEditForm((prev: any) => ({
                        ...prev,
                        content: {
                          ...(prev.content || {}),
                          acceptedAnswers,
                          _rawAccepted: raw
                        }
                      }));
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Explanation */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Giải thích (Markdown)</label>
            <textarea 
              className="w-full border p-4 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none text-sm h-24 border-gray-200" 
              value={editForm.explanation || ''} 
              onChange={e => setEditForm({...editForm, explanation: e.target.value})} 
            />
          </div>

          {/* Row 5: Tags & Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (Ngăn cách bởi dấu phẩy)</label>
              <input 
                type="text" 
                className="w-full p-2.5 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#c7cf35]" 
                placeholder="grammar, hsk1, vocabulary"
                value={editForm.tags || ''} 
                onChange={(e) => setEditForm({...editForm, tags: e.target.value})} 
              />
            </div>
            <div className="flex gap-6 items-center pt-8">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActiveQuestion"
                  className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                  checked={editForm.isActive ?? true} 
                  onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
                />
                <label htmlFor="isActiveQuestion" className="text-sm font-semibold text-gray-700 cursor-pointer">Kích hoạt</label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isPublicQuestion"
                  className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                  checked={editForm.visibility === 'PUBLIC'} 
                  onChange={e => setEditForm({...editForm, visibility: e.target.checked ? 'PUBLIC' : 'PRIVATE'})} 
                />
                <label htmlFor="isPublicQuestion" className="text-sm font-semibold text-gray-700 cursor-pointer">Công khai (Public)</label>
              </div>
            </div>
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

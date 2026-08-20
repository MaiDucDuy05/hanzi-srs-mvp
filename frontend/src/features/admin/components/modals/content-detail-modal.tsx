'use client';
import { X } from 'lucide-react';

interface ContentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: any | null;
  loading: boolean;
}

export const ContentDetailModal = ({ isOpen, onClose, content, loading }: ContentDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-[#11321e]">Chi tiết nội dung</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center p-8 text-gray-500">Đang tải...</div>
          ) : content ? (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tiêu đề / Nội dung chính</label>
                <div className="mt-1 text-gray-900 font-medium whitespace-pre-wrap bg-gray-50 p-4 rounded-2xl">
                  {content.type === 'question' 
                    ? (content.content?.question || content.content?.questionText || '(Không có nội dung câu hỏi)')
                    : (content.title || content.name || content.prompt || '(Không có)')}
                </div>
              </div>

              {content.type === 'question' && content.content && (
                <div className="mt-4 p-4 border border-gray-100 rounded-2xl bg-white shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-gray-700">Dữ liệu Câu hỏi:</h4>
                  
                  {content.content.options && Array.isArray(content.content.options) && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Các lựa chọn:</span>
                      <ul className="list-disc list-inside mt-1 ml-2 text-sm text-gray-800">
                        {content.content.options.map((opt: any, i: number) => (
                          <li key={i}>{typeof opt === 'object' && opt !== null ? (opt.text || JSON.stringify(opt)) : String(opt)}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(content.content.correctAnswer !== undefined || content.content.correct_answer !== undefined) && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Đáp án đúng:</span>
                      <div className="mt-1 font-mono text-sm bg-green-50 text-green-700 px-2 py-1 rounded inline-block">
                        {typeof (content.content.correctAnswer ?? content.content.correct_answer) === 'object'
                          ? JSON.stringify(content.content.correctAnswer ?? content.content.correct_answer)
                          : String(content.content.correctAnswer ?? content.content.correct_answer)}
                      </div>
                    </div>
                  )}

                  {content.content.acceptedAnswers && Array.isArray(content.content.acceptedAnswers) && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Các đáp án chấp nhận (Điền khuyết):</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {content.content.acceptedAnswers.map((ans: any, i: number) => (
                          <span key={i} className="font-mono text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {typeof ans === 'object' && ans !== null ? (ans.text || JSON.stringify(ans)) : String(ans)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {content.content.correctOrder && Array.isArray(content.content.correctOrder) && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Thứ tự đúng (Sắp xếp):</span>
                      <div className="mt-1 font-mono text-sm bg-purple-50 text-purple-700 px-2 py-1 rounded inline-block">
                        {content.content.correctOrder.map((item: any) => typeof item === 'object' && item !== null ? (item.text || JSON.stringify(item)) : String(item)).join(' ➔ ')}
                      </div>
                    </div>
                  )}
                  
                  {content.explanation && (
                    <div>
                      <span className="text-xs font-semibold text-gray-500">Giải thích:</span>
                      <div className="mt-1 text-sm text-gray-700 italic">
                        {content.explanation}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</label>
                  <div className="mt-1 text-gray-900 truncate" title={content.id}>{content.id}</div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phân loại (Sub-type)</label>
                  <div className="mt-1 text-gray-900 font-mono text-sm">{content.question_type || content.type}</div>
                </div>
              </div>
              
              {content.hiddenByAdmin && (
                <div>
                  <label className="text-xs font-semibold text-red-500 uppercase tracking-wider">Lý do phạt</label>
                  <div className="mt-1 text-red-700 bg-red-50 p-3 rounded-xl">
                    {content.hideReason || 'Không có lý do'}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100">
                <details className="cursor-pointer">
                  <summary className="text-sm font-semibold text-gray-600 hover:text-forest">Xem dữ liệu thô (Raw JSON)</summary>
                  <pre className="mt-2 text-xs bg-gray-800 text-green-400 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(content, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">Không tìm thấy dữ liệu</div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

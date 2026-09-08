'use client';

import { useEffect, useState, use } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/features/ui/components/button';
import { resourceApi } from '@/lib/api/endpoints';
import type { MistakeBookEntry } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { cn } from '@/lib/utils/cn';
import { Calendar, Volume2, Info, Pencil, Check, PlayCircle } from 'lucide-react';

export default function MistakeDetail({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('MistakeBook');
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const [detail, setDetail] = useState<MistakeBookEntry | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    if (!id) return;
    resourceApi.getMistake(id).then((data) => {
      setDetail(data);
    }).catch((e) => {
      console.error(e);
      setDetail(null);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleSaveNote = async () => {
    if (!detail) return;
    setIsSavingNote(true);
    try {
      const updated = await resourceApi.updateMistake(detail.id, { userNote: noteText });
      setDetail({ ...detail, userNote: updated.userNote });
      setIsEditingNote(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingNote(false);
    }
  };

  if (loading) {
    return <PageLoading label={t('loadingDetail', { fallback: 'Đang tải...' })} />;
  }

  if (!detail) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">{t('detailNotFound')}</h2>
      </div>
    );
  }

  const qs = detail.questionSnapshot || {};
  const word = qs.prompt || qs.word || qs.char || detail.sourceId;
  const pinyin = qs.pinyin || '';
  const meaning = qs.translation || qs.meaning || '';
  const typeKeyStr = detail.questionType === 'VOCAB' ? 'typeVocabulary' : 'typeGrammar';
  const lastWrong = detail.lastFailedAt ? new Date(detail.lastFailedAt).toLocaleDateString() : '';

  const isVocab = detail.questionType === 'VOCAB';
  const typeLabel = isVocab ? 'Từ vựng' : 'Ngữ pháp';
  const timesWrong = detail.failCount || 0;

  // Render character blocks if there are multiple characters (e.g. sentence ordering)
  const characters = word.split('').filter((c: string) => c.trim().length > 0);

  return (
    <div className="h-full flex flex-col px-8 py-8">
      {/* Top row */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className={cn(
            "px-3 py-1 text-sm font-semibold rounded-full",
            isVocab ? "bg-blue-50 text-blue-600" : "bg-[#e8f5e9] text-[#2e7d32]"
          )}>
            {typeLabel}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1.5">
            <Calendar className="w-4 h-4" /> Thêm vào ngày: {lastWrong}
          </span>
        </div>
        <div className="px-4 py-1.5 bg-[#fce4e4] text-[#d32f2f] text-sm font-bold rounded-full flex items-center gap-1.5 shadow-sm">
          <span className="text-xl">{timesWrong}</span> Lần sai cần chú ý
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 mb-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h4 className="text-[#2e7d32] font-semibold text-sm uppercase tracking-wider">
            {isVocab ? 'CÂU HỎI TỪ VỰNG' : 'CÂU HỎI NGỮ PHÁP'}
          </h4>
          <button className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-2 transition-colors">
            <Volume2 className="w-4 h-4" /> Phát âm chuẩn
          </button>
        </div>
        <div className="mb-6">
          <p className="font-bold text-gray-900 text-lg mb-4">
            {qs.type === 'sentence_ordering' ? 'Nội dung câu hỏi:' : 'Nội dung câu hỏi:'}
          </p>
          {isVocab ? (
            <div className="flex flex-wrap gap-3 items-center">
              {characters.map((char: string, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center text-3xl font-medium text-gray-800 bg-white shadow-sm">
                    {char}
                  </div>
                  {i < characters.length - 1 && <span className="text-gray-300 text-2xl font-light">/</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-5 rounded-xl border border-gray-200 bg-[#f9fafb]">
              <p className="text-2xl font-medium text-gray-800 leading-relaxed">
                {word}
              </p>
            </div>
          )}
        </div>
        {meaning && (
          <div className="bg-[#f9fafb] rounded-xl p-4 border border-gray-100 flex items-start gap-4">
            <span className="px-2 py-1 bg-[#e8f5e9] text-[#2e7d32] text-xs font-bold rounded mt-0.5">VI</span>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bản dịch nghĩa:</p>
              <p className="font-bold text-gray-900">{meaning}</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="space-y-4 mb-8">
        {/* System Note */}
        <div className="bg-[#fffdf0] rounded-[1.25rem] p-5 border border-[#ffecb3] flex items-start gap-3 shadow-sm">
          <Info className="w-5 h-5 text-[#f57c00] mt-0.5 shrink-0" />
          <div>
            <h5 className="font-bold text-gray-800 mb-1">Ghi chú lỗi sai</h5>
            <p className="text-sm text-gray-600">
              {detail.explanation ? (
                <span dangerouslySetInnerHTML={{ __html: detail.explanation }} />
              ) : (
                <span className="italic">Không có ghi chú từ hệ thống.</span>
              )}
            </p>
          </div>
        </div>

        {/* User Note */}
        <div className={cn(
          "bg-white rounded-[1.25rem] p-5 border shadow-sm transition-all relative group",
          isEditingNote ? "border-[#4caf50] ring-1 ring-[#4caf50]" : "border-gray-200 hover:border-gray-300"
        )}>
          <div className="flex justify-between items-center mb-3">
            <h5 className="font-bold text-gray-800 flex items-center gap-2">
              <Pencil className="w-4 h-4 text-[#4caf50]" /> Ghi chú của tôi
            </h5>
            {isEditingNote && <span className="text-xs text-gray-400">Tự động lưu tạm thời</span>}
          </div>
          
          {isEditingNote ? (
            <div>
              <textarea
                className="w-full border-none focus:ring-0 resize-none outline-none text-gray-700 min-h-[80px] p-0 text-sm"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={t('detailMyNotePlaceholder')}
                autoFocus
              />
              <div className="flex justify-end gap-3 mt-3">
                <button 
                  onClick={() => setIsEditingNote(false)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium px-4 py-2"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleSaveNote}
                  disabled={isSavingNote}
                  className="bg-[#2e7d32] hover:bg-[#1b5e20] text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSavingNote ? <span className="animate-pulse">...</span> : <><Check className="w-4 h-4" /> Lưu</>}
                </button>
              </div>
            </div>
          ) : (
            <div 
              className="min-h-[60px] cursor-text"
              onClick={() => { setIsEditingNote(true); setNoteText(detail.userNote || ''); }}
            >
              {detail.userNote ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.userNote}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">{t('detailMyNotePlaceholder')}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Action Bar */}
      <div className="mt-auto pt-6 border-t border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#4caf50]"></span>
          Số lần trả lời đúng liên tiếp: <span className="font-bold text-gray-900">{detail.correctStreak || 0} lần</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              resourceApi.submitMistakeReview(detail.id, true).then(() => {
                window.location.reload();
              }).catch(console.error);
            }}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" /> Đánh dấu đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

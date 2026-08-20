'use client';

import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { X, Search, Plus, Trash2, BookOpen, PenTool } from 'lucide-react';

interface LessonContentManagerProps {
  lessonId: string;
  courseId: string;
  onClose: () => void;
}

export const LessonContentManager = ({ lessonId, courseId, onClose }: LessonContentManagerProps) => {
  const [contents, setContents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'VOCABULARY' | 'GRAMMAR'>('VOCABULARY');

  // Search Results
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchContents();
  }, [lessonId]);

  const fetchContents = async () => {
    try {
      setLoading(true);
      const res = await adminContentApi.getLessonContents({ lessonId, limit: 100 }) as any;
      setContents(res.data?.items || res.data || []);
    } catch (error) {
      console.error('Failed to fetch lesson contents', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setIsSearching(true);
      if (activeTab === 'VOCABULARY') {
        const res = await adminContentApi.getVocabularies({ search: q, limit: 10 }) as any;
        setSearchResults(res.data?.items || res.data || []);
      } else {
        const res = await adminContentApi.getGrammars({ search: q, limit: 10 }) as any;
        setSearchResults(res.data?.items || res.data || []);
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddContent = async (contentId: string) => {
    try {
      await adminContentApi.addLessonContent({
        lessonId,
        contentType: activeTab,
        contentId,
        displayOrder: contents.length + 1
      });
      fetchContents();
      setSearchQuery('');
      setSearchResults([]);
    } catch (err) {
      alert('Lỗi khi thêm nội dung vào bài học (có thể đã tồn tại)');
    }
  };

  const handleRemoveContent = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khỏi bài học?')) return;
    try {
      await adminContentApi.removeLessonContent(id);
      fetchContents();
    } catch (err) {
      alert('Lỗi khi xóa nội dung');
    }
  };

  const filteredContents = contents.filter(c => c.contentType === activeTab);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-[#11321e]">Quản lý Nội Dung Bài Học</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Gán Từ vựng và Ngữ pháp vào bài học này</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 shrink-0 px-6">
          <button
            onClick={() => { setActiveTab('VOCABULARY'); setSearchQuery(''); setSearchResults([]); }}
            className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'VOCABULARY' ? 'border-[#11321e] text-[#11321e]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Từ Vựng
          </button>
          <button
            onClick={() => { setActiveTab('GRAMMAR'); setSearchQuery(''); setSearchResults([]); }}
            className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'GRAMMAR' ? 'border-[#11321e] text-[#11321e]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <PenTool className="w-4 h-4" /> Ngữ Pháp
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden bg-gray-50/30">
          
          {/* Left: Current Contents */}
          <div className="flex-1 border-r border-gray-100 flex flex-col overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-100 shrink-0">
              <h3 className="font-bold text-[#11321e]">Đã có trong bài học ({filteredContents.length})</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loading ? (
                <div className="text-center p-8 text-gray-400">Đang tải...</div>
              ) : filteredContents.length === 0 ? (
                <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-gray-500 font-medium">Chưa có {activeTab === 'VOCABULARY' ? 'từ vựng' : 'ngữ pháp'} nào trong bài học này.</p>
                </div>
              ) : (
                filteredContents.map(item => (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group">
                    <div>
                      {item.contentType === 'VOCABULARY' && item.vocabulary && (
                        <>
                          <div className="flex items-end gap-2 mb-1">
                            <span className="text-xl font-bold text-[#11321e]">{item.vocabulary.hanzi}</span>
                            <span className="text-sm font-medium text-gray-500">{item.vocabulary.pinyin}</span>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-1">{item.vocabulary.meaning_vi}</p>
                        </>
                      )}
                      {item.contentType === 'GRAMMAR' && item.grammar && (
                        <>
                          <div className="text-base font-bold text-[#11321e] mb-1">{item.grammar.title}</div>
                          <p className="text-sm text-gray-600 line-clamp-1">{item.grammar.structure}</p>
                        </>
                      )}
                      {!item.vocabulary && !item.grammar && (
                        <span className="text-gray-400">Không tìm thấy chi tiết (ID: {item.contentId})</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleRemoveContent(item.id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Search & Add */}
          <div className="w-[400px] flex flex-col bg-white overflow-hidden shrink-0">
            <div className="p-4 border-b border-gray-100 shrink-0 space-y-4">
              <h3 className="font-bold text-[#11321e]">Tìm & Thêm vào bài học</h3>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder={`Tìm ${activeTab === 'VOCABULARY' ? 'từ vựng (hanzi, pinyin...)' : 'ngữ pháp'}...`}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#c7cf35] transition-shadow"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <div className="text-center p-6 text-gray-500 text-sm">Không tìm thấy kết quả.</div>
              )}
              {isSearching && (
                <div className="text-center p-6 text-gray-400 text-sm">Đang tìm...</div>
              )}
              {searchResults.map(result => {
                // Check if already added
                const isAdded = filteredContents.some(c => c.contentId === result.id);
                return (
                  <div key={result.id} className="bg-white p-3 rounded-xl border border-gray-200 flex items-center justify-between">
                    <div className="min-w-0 pr-3">
                      {activeTab === 'VOCABULARY' ? (
                        <>
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-bold text-[#11321e]">{result.hanzi}</span>
                            <span className="text-xs text-gray-500">{result.pinyin}</span>
                          </div>
                          <div className="text-xs text-gray-600 truncate">{result.meaningVi}</div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold text-[#11321e] text-sm truncate">{result.title}</div>
                          <div className="text-xs text-gray-600 truncate">{result.structure}</div>
                        </>
                      )}
                    </div>
                    
                    <button 
                      disabled={isAdded}
                      onClick={() => handleAddContent(result.id)}
                      className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                        isAdded 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] shadow-sm'
                      }`}
                    >
                      <Plus className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                );
              })}
            </div>
            
            {/* Action Bottom */}
            <div className="p-4 border-t border-gray-100 bg-white shrink-0">
              <button 
                onClick={() => alert('Chức năng tạo nhanh sắp ra mắt. Tạm thời vui lòng sang tab tương ứng để tạo!')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 font-bold hover:bg-gray-50 hover:border-gray-400 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Tạo {activeTab === 'VOCABULARY' ? 'Từ Vựng' : 'Ngữ Pháp'} Mới
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

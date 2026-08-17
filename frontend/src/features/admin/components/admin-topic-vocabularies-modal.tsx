import { useState, useEffect } from 'react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';
import { X, Search, Check, Trash2, Plus } from 'lucide-react';

interface Props {
  topic: any;
  onClose: () => void;
}

export const AdminTopicVocabulariesModal = ({ topic, onClose }: Props) => {
  const [topicVocabs, setTopicVocabs] = useState<any[]>([]);
  const [allVocabs, setAllVocabs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVocabs = async () => {
      try {
        setLoading(true);
        const [topicRes, allRes] = await Promise.all([
          adminContentApi.getTopicVocabularies(topic.id),
          adminContentApi.getVocabularies({ limit: 1000 })
        ]);
        
        const currentVocabs = (topicRes as any).data || [];
        setTopicVocabs(currentVocabs);
        setAllVocabs((allRes as any).data?.items || (allRes as any).data || []);
      } catch (error) {
        console.error('Error fetching vocabularies:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVocabs();
  }, [topic.id]);

  const handleAssign = async (vocabId: string) => {
    try {
      const currentIds = topicVocabs.map(v => v.id);
      if (currentIds.includes(vocabId)) return;
      
      const newIds = [...currentIds, vocabId];
      await adminContentApi.assignTopicVocabularies(topic.id, newIds);
      
      const addedVocab = allVocabs.find(v => v.id === vocabId);
      if (addedVocab) {
        setTopicVocabs([...topicVocabs, addedVocab]);
      }
    } catch (error) {
      console.error('Error assigning vocabulary:', error);
      alert('Gán từ vựng thất bại');
    }
  };

  const handleRemove = async (vocabId: string) => {
    try {
      await adminContentApi.removeTopicVocabulary(topic.id, vocabId);
      setTopicVocabs(topicVocabs.filter(v => v.id !== vocabId));
    } catch (error) {
      console.error('Error removing vocabulary:', error);
      alert('Bỏ gán thất bại');
    }
  };

  const currentIds = topicVocabs.map(v => v.id);
  const filteredVocabs = allVocabs.filter(v => 
    !currentIds.includes(v.id) && 
    (v.hanzi?.includes(search) || v.pinyin?.includes(search) || v.meaningVi?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-[#11321e]">Từ vựng của Chủ đề: {topic.name}</h2>
            <p className="text-sm text-gray-500 mt-1">Gán hoặc gỡ bỏ từ vựng cho chủ đề này</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
          {/* Left panel: Assigned vocabularies */}
          <div className="flex-1 border-r flex flex-col p-4 bg-gray-50">
            <h3 className="font-bold text-[#11321e] mb-4">Đã gán ({topicVocabs.length})</h3>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Đang tải...</div>
              ) : topicVocabs.length === 0 ? (
                <div className="text-center text-gray-400 py-4 bg-white rounded-xl border border-dashed border-gray-300">Chưa có từ vựng nào</div>
              ) : (
                topicVocabs.map((vocab: any) => (
                  <div key={vocab.id} className="flex items-center justify-between p-3 bg-white border rounded-xl shadow-sm">
                    <div>
                      <div className="font-bold text-lg">{vocab.hanzi} <span className="text-sm font-normal text-gray-500 ml-2">{vocab.pinyin}</span></div>
                      <div className="text-sm text-gray-600 line-clamp-1">{vocab.meaningVi}</div>
                    </div>
                    <button 
                      onClick={() => handleRemove(vocab.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Bỏ gán"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
          
          {/* Right panel: Available vocabularies */}
          <div className="flex-1 flex flex-col p-4">
            <h3 className="font-bold text-[#11321e] mb-4">Từ vựng khả dụng</h3>
            
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="text-gray-400 w-4 h-4" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c7cf35]"
                placeholder="Tìm từ vựng (hán tự, pinyin, nghĩa)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {loading ? (
                <div className="text-center text-gray-400 py-4">Đang tải...</div>
              ) : filteredVocabs.length === 0 ? (
                <div className="text-center text-gray-400 py-4">Không tìm thấy từ vựng phù hợp</div>
              ) : (
                filteredVocabs.map((vocab: any) => (
                  <div key={vocab.id} className="flex items-center justify-between p-3 border rounded-xl hover:border-[#c7cf35] transition-colors cursor-pointer group" onClick={() => handleAssign(vocab.id)}>
                    <div>
                      <div className="font-bold text-lg">{vocab.hanzi} <span className="text-sm font-normal text-gray-500 ml-2">{vocab.pinyin}</span></div>
                      <div className="text-sm text-gray-600 line-clamp-1">{vocab.meaningVi}</div>
                    </div>
                    <button className="p-1 rounded-full bg-gray-100 text-gray-400 group-hover:bg-[#c7cf35] group-hover:text-[#11321e] transition-colors">
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

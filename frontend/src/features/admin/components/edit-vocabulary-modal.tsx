import { X, Save } from 'lucide-react';

interface EditVocabularyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  saving: boolean;
  editForm: any;
  setEditForm: (form: any) => void;
  hskLevels: any[];
}

export function EditVocabularyModal({
  isOpen,
  onClose,
  onSave,
  saving,
  editForm,
  setEditForm,
  hskLevels,
}: EditVocabularyModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    const payload = { ...editForm };
    if (!payload.meaningVi && payload.meaning) {
      payload.meaningVi = payload.meaning;
    }
    onSave(payload);
  };

  const isFormValid =
    editForm.hanzi &&
    editForm.pinyin &&
    (editForm.meaningVi || editForm.meaning) &&
    editForm.levelId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative">
        <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#11321e]">
            {editForm.id ? 'Sửa Từ vựng' : 'Thêm Từ vựng Mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hán tự *</label>
              <input 
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none font-bold text-xl" 
                value={editForm.hanzi || ''} 
                onChange={e => setEditForm({...editForm, hanzi: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pinyin *</label>
              <input 
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
                value={editForm.pinyin || ''} 
                onChange={e => setEditForm({...editForm, pinyin: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nghĩa Tiếng Việt *</label>
            <input 
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
              value={editForm.meaningVi || editForm.meaning || ''} 
              onChange={e => setEditForm({...editForm, meaningVi: e.target.value, meaning: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cấp độ (HSK) *</label>
              <select 
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white"
                value={editForm.levelId || ''} 
                onChange={e => setEditForm({...editForm, levelId: e.target.value})}
              >
                <option value="" disabled>-- Chọn HSK --</option>
                {hskLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Từ loại</label>
              <input 
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none" 
                value={editForm.partOfSpeech || ''} 
                onChange={e => setEditForm({...editForm, partOfSpeech: e.target.value})} 
                placeholder="vd: Danh từ, Động từ..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Ví dụ minh họa</label>
            <textarea 
              className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none min-h-[80px]" 
              value={editForm.example || ''} 
              onChange={e => setEditForm({...editForm, example: e.target.value})} 
              placeholder="Tiếng Trung: Pinyin - Nghĩa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
              <select 
                className="w-full border p-2 rounded-xl focus:ring-2 focus:ring-[#c7cf35] outline-none bg-white"
                value={editForm.status || 'DRAFT'} 
                onChange={e => setEditForm({...editForm, status: e.target.value})}
              >
                <option value="DRAFT">Bản nháp (DRAFT)</option>
                <option value="PUBLISHED">Công khai (PUBLISHED)</option>
                <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input 
                type="checkbox" 
                id="isActiveVocab"
                className="w-4 h-4 text-[#c7cf35] rounded border-gray-300 focus:ring-[#c7cf35]"
                checked={editForm.isActive ?? true} 
                onChange={e => setEditForm({...editForm, isActive: e.target.checked})} 
              />
              <label htmlFor="isActiveVocab" className="text-sm font-semibold text-gray-700">Trạng thái Kích hoạt</label>
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 sticky bottom-0 z-10">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Đang lưu...' : (
              <>
                <Save className="w-4 h-4" />
                Lưu Từ vựng
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

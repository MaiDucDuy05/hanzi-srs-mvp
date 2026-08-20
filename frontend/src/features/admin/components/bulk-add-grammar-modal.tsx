import { useState, useRef } from 'react';
import { X, Save, Plus, Trash2, UploadCloud } from 'lucide-react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';

interface BulkAddGrammarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hskLevels: any[];
}

export function BulkAddGrammarModal({
  isOpen,
  onClose,
  onSuccess,
  hskLevels,
}: BulkAddGrammarModalProps) {
  const [rows, setRows] = useState<any[]>([
    { title: '', structure: '', explanation: '', levelId: hskLevels[0]?.id || '' }
  ]);
  const [saving, setSaving] = useState(false);
  const [selectedImportLevelId, setSelectedImportLevelId] = useState<string>(hskLevels[0]?.id || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync selected level when hskLevels load
  if (!selectedImportLevelId && hskLevels.length > 0) {
    setSelectedImportLevelId(hskLevels[0].id);
  }

  if (!isOpen) return null;

  const parseCSV = (text: string) => {
    const rows = [];
    let curRow = [];
    let curCell = '';
    let insideQuote = false;
    
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (insideQuote && text[i+1] === '"') {
          curCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        curRow.push(curCell);
        curCell = '';
      } else if ((c === '\n' || c === '\r') && !insideQuote) {
        if (c === '\r' && text[i+1] === '\n') i++; // skip \r\n
        curRow.push(curCell);
        // Only push non-empty rows
        if (curRow.some(cell => cell.trim())) {
          rows.push(curRow);
        }
        curRow = [];
        curCell = '';
      } else {
        curCell += c;
      }
    }
    if (curCell || curRow.length) {
      curRow.push(curCell);
      if (curRow.some(cell => cell.trim())) {
        rows.push(curRow);
      }
    }
    return rows;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      let text = evt.target?.result as string;
      if (!text) return;
      
      // Remove BOM if present
      if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
      }

      const parsed = parseCSV(text);
      if (parsed.length === 0) return;

      // Check if first row is header
      const header = parsed[0].map(s => s.toLowerCase().trim());
      const hasHeader = header.includes('title') || header.includes('tiêu đề') || header.includes('structure') || header.includes('explanation');
      
      const dataRows = hasHeader ? parsed.slice(1) : parsed;
      const defaultLevelId = selectedImportLevelId || hskLevels[0]?.id || '';

      const newRows = dataRows.map(r => ({
        title: r[0]?.trim() || '',
        structure: r[1]?.trim() || '',
        explanation: r[2]?.trim() || '',
        levelId: defaultLevelId
      }));

      // If the current first row is empty, replace it completely, else append
      const isFirstRowEmpty = rows.length === 1 && !rows[0].title && !rows[0].structure && !rows[0].explanation;
      if (isFirstRowEmpty) {
        setRows(newRows);
      } else {
        setRows([...rows, ...newRows]);
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleAddRow = () => {
    setRows([...rows, { title: '', structure: '', explanation: '', levelId: hskLevels[0]?.id || '' }]);
  };

  const handleRemoveRow = (index: number) => {
    if (rows.length === 1) return;
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleChange = (index: number, field: string, value: string) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const handleSaveAll = async () => {
    // Filter out completely empty rows
    const validRows = rows.filter(r => r.title.trim() && r.structure.trim());
    
    if (validRows.length === 0) {
      alert('Chưa có dữ liệu nào hợp lệ để lưu.');
      return;
    }

    try {
      setSaving(true);
      // Execute all create requests in parallel
      await Promise.all(
        validRows.map(row => 
          adminContentApi.createGrammar({
            ...row,
            status: 'PUBLISHED',
            isActive: true
          })
        )
      );
      
      alert(`Đã thêm thành công ${validRows.length} ngữ pháp!`);
      // Reset form
      setRows([{ title: '', structure: '', explanation: '', levelId: hskLevels[0]?.id || '' }]);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to bulk add grammars', error);
      alert('Lỗi khi thêm danh sách ngữ pháp. Vui lòng kiểm tra lại.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl my-8 relative flex flex-col max-h-[90vh]">
        <div className="p-6 border-b flex justify-between items-center bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#11321e]">Thêm Nhiều Ngữ Pháp</h2>
            <p className="text-sm text-gray-500 mt-1">Nhập nhanh nhiều ngữ pháp hoặc tải lên từ file CSV.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
              <span className="text-sm font-semibold text-gray-500 pl-2">Gắn vào:</span>
              <select 
                className="border-none bg-white p-1.5 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#c7cf35] outline-none text-[#11321e] shadow-sm"
                value={selectedImportLevelId}
                onChange={e => setSelectedImportLevelId(e.target.value)}
              >
                {hskLevels.map(lvl => (
                  <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                ))}
              </select>
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-100 transition-colors"
              >
                <UploadCloud className="h-4 w-4" />
                Import từ CSV
              </button>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          <table className="w-full text-left border-collapse bg-white shadow-sm rounded-xl overflow-hidden ring-1 ring-gray-200">
            <thead className="bg-gray-100 text-gray-600 text-sm">
              <tr>
                <th className="p-3 font-semibold w-12 text-center">#</th>
                <th className="p-3 font-semibold w-[25%]">Tiêu đề *</th>
                <th className="p-3 font-semibold w-[25%]">Cấu trúc *</th>
                <th className="p-3 font-semibold w-[30%]">Giải thích</th>
                <th className="p-3 font-semibold w-[10%]">HSK *</th>
                <th className="p-3 font-semibold w-16 text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50 focus-within:bg-blue-50/30 transition-colors">
                  <td className="p-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                  <td className="p-3">
                    <input 
                      autoFocus={idx === rows.length - 1}
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-lg font-bold text-[#11321e] placeholder-gray-300"
                      placeholder="VD: 把"
                      value={row.title}
                      onChange={e => handleChange(idx, 'title', e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-700 placeholder-gray-300"
                      placeholder="VD: Chủ ngữ + 把 + Tân ngữ + Động từ"
                      value={row.structure}
                      onChange={e => handleChange(idx, 'structure', e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <input 
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-700 placeholder-gray-300"
                      placeholder="VD: Dùng để nhấn mạnh sự xử lý..."
                      value={row.explanation}
                      onChange={e => handleChange(idx, 'explanation', e.target.value)}
                    />
                  </td>
                  <td className="p-3">
                    <select 
                      className="w-full bg-transparent border-0 focus:ring-0 p-0 text-gray-700 font-medium"
                      value={row.levelId}
                      onChange={e => handleChange(idx, 'levelId', e.target.value)}
                    >
                      <option value="" disabled>-- HSK --</option>
                      {hskLevels.map(lvl => (
                        <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center text-gray-400 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-6">{idx + 1}</span>
                      <button 
                        onClick={() => handleRemoveRow(idx)}
                        disabled={rows.length === 1}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors p-1.5 rounded-md hover:bg-red-50"
                        title="Xóa hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4">
            <button 
              onClick={handleAddRow}
              className="flex items-center gap-2 text-sm font-bold text-[#4a5a3a] bg-[#f3f4e1] hover:bg-[#dde8a6] px-4 py-2 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm dòng trống
            </button>
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={onClose}
            disabled={saving}
            className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-2 rounded-xl font-bold bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] shadow-sm transition-colors disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : (
              <>
                <Save className="w-5 h-5" />
                Lưu toàn bộ
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { X, UploadCloud } from 'lucide-react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminContentApi.importVocabulariesCsv(formData) as any;
      
      alert(res.message || 'Nhập dữ liệu thành công');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Import failed', error);
      alert('Có lỗi xảy ra khi nhập file CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-[#11321e]">Nhập Từ Vựng (CSV)</h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-6 font-medium">
            Tải lên file CSV chứa danh sách từ vựng. Cột yêu cầu: Hanzi, Pinyin, Meaning.
          </p>

          <div className="border-2 border-dashed border-[#dde8a6] bg-[#fcfbe8] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#f3f4e1] transition-colors relative">
            <input 
              type="file" 
              accept=".csv" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <UploadCloud className="h-10 w-10 text-[#c7cf35] mb-3" />
            
            {file ? (
              <p className="text-[#11321e] font-bold text-sm truncate max-w-xs">{file.name}</p>
            ) : (
              <>
                <p className="text-[#11321e] font-bold text-sm mb-1">Kéo thả file CSV vào đây</p>
                <p className="text-gray-400 text-xs font-medium">Hoặc click để chọn file</p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={uploading}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-5 py-2.5 rounded-full text-sm font-bold text-[#11321e] bg-[#c7cf35] hover:bg-[#dde8a6] transition-colors disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {uploading ? 'Đang xử lý...' : 'Bắt đầu Nhập'}
          </button>
        </div>

      </div>
    </div>
  );
}

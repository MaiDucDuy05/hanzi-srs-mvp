import { Button } from '@/features/ui/components/button';

// Giả lập dữ liệu fetch từ DB dựa vào params.id
const getMockDetail = (id: string) => {
  const MOCK_DB = {
    '1': { word: '银行', pinyin: 'yínháng', meaning: 'Ngân hàng', type: 'Từ vựng', wrongCount: 3, lastWrong: '2023-10-01', note: 'Hay viết nhầm nét bên phải chữ 银 thành 很.' },
    '2': { word: '买', pinyin: 'mǎi', meaning: 'Mua', type: 'Từ vựng', wrongCount: 5, lastWrong: '2023-10-05', note: 'Thiếu mất bộ Thập ở trên, dễ nhầm với chữ 卖 (Bán).' },
    '3': { word: '卖', pinyin: 'mài', meaning: 'Bán', type: 'Ngữ pháp', wrongCount: 2, lastWrong: '2023-10-05', note: 'Hay bị nhầm phát âm thanh 4 với thanh 3.' },
    '4': { word: '图书馆', pinyin: 'túshūguǎn', meaning: 'Thư viện', type: 'Từ vựng', wrongCount: 1, lastWrong: '2023-10-10', note: 'Quên cách viết chữ 館.' },
  };
  return MOCK_DB[id as keyof typeof MOCK_DB] || null;
};

export default function MistakeDetail({ params }: { params: { id: string } }) {
  const detail = getMockDetail(params.id);

  if (!detail) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy lỗi sai</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      
      {/* Header chi tiết */}
      <div className="p-8 border-b border-gray-100 bg-green-50/50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white text-green-700 text-sm font-bold rounded-full border border-green-200">
                {detail.type}
              </span>
              <span className="text-sm text-gray-500">Thêm vào ngày: {detail.lastWrong}</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2 font-heading">{detail.word}</h1>
            <p className="text-2xl text-gray-600 mb-1">{detail.pinyin}</p>
            <p className="text-xl text-gray-700 font-medium">{detail.meaning}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-center justify-center bg-red-50 text-red-700 rounded-2xl p-4 min-w-[100px]">
              <span className="text-3xl font-black">{detail.wrongCount}</span>
              <span className="text-sm font-medium mt-1">Lần sai</span>
            </div>
          </div>
        </div>
      </div>

      {/* Nội dung Ghi chú & Ôn tập */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Ghi chú lỗi sai
          </h3>
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 text-gray-700 leading-relaxed">
            {detail.note}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
            Ôn tập ngay
          </Button>
          <Button size="lg" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
            Đã thuộc (Xóa khỏi sổ tay)
          </Button>
        </div>
      </div>
      
    </div>
  );
}

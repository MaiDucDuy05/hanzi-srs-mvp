import Link from 'next/link';

export const metadata = {
  title: 'Sổ tay lỗi sai - Hanzi SRS',
};

const MOCK_MISTAKES = [
  { id: '1', word: '银行', pinyin: 'yínháng', meaning: 'Ngân hàng', date: '2023-10-01', type: 'Từ vựng' },
  { id: '2', word: '买', pinyin: 'mǎi', meaning: 'Mua', date: '2023-10-05', type: 'Từ vựng' },
  { id: '3', word: '卖', pinyin: 'mài', meaning: 'Bán', date: '2023-10-05', type: 'Ngữ pháp' },
  { id: '4', word: '图书馆', pinyin: 'túshūguǎn', meaning: 'Thư viện', date: '2023-10-10', type: 'Từ vựng' },
];

export default function MistakeBookLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-140px)] w-full gap-6">
      
      {/* CỘT TRÁI: Danh sách (Master List) */}
      <aside className="w-[300px] flex-shrink-0 border-r border-gray-100 pr-4 flex flex-col h-full">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Sổ tay lỗi sai</h2>
          <p className="text-sm text-gray-500 mt-1">Các từ/ngữ pháp hay nhầm</p>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {MOCK_MISTAKES.map((mistake) => (
            <Link 
              key={mistake.id}
              href={`/mistake-book/${mistake.id}`}
              className="block p-4 bg-white border border-gray-100 rounded-xl hover:border-green-300 hover:shadow-sm transition-all focus:ring-2 focus:ring-green-500 outline-none"
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-lg text-gray-900">{mistake.word}</span>
                <span className="text-xs font-medium px-2 py-1 bg-red-50 text-red-600 rounded-full">{mistake.type}</span>
              </div>
              <p className="text-sm text-gray-500 mb-2">{mistake.pinyin} - {mistake.meaning}</p>
              <p className="text-xs text-gray-400">Lần cuối sai: {mistake.date}</p>
            </Link>
          ))}
        </div>
      </aside>

      {/* CỘT PHẢI: Nội dung chi tiết (Detail) */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
    </div>
  );
}

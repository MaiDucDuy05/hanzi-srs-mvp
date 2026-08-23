import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/features/ui/components/button';
import { Settings, Clock, Users, PlayCircle, X } from 'lucide-react';

interface LiveQuizConfigModalProps {
  open: boolean;
  onClose: () => void;
  testId: string;
}

export function LiveQuizConfigModal({ open, onClose, testId }: LiveQuizConfigModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>('MANUAL');
  const [questionTime, setQuestionTime] = useState(10);
  const [leaderboardTime, setLeaderboardTime] = useState(5);

  if (!open) return null;

  const handleStart = () => {
    let url = `/teacher/exams/${testId}/live?mode=${mode}`;
    if (mode === 'AUTO') {
      url += `&qt=${questionTime}&lt=${leaderboardTime}`;
    }
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2 text-[#1f5333]">
            <Settings className="w-5 h-5" />
            <h2 className="font-bold text-lg">Cấu hình Live Quiz</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 block">Chế độ chuyển câu</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setMode('MANUAL')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === 'MANUAL'
                    ? 'border-[#8BC34A] bg-[#8BC34A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className={`w-4 h-4 ${mode === 'MANUAL' ? 'text-[#8BC34A]' : 'text-gray-400'}`} />
                  <span className={`font-bold ${mode === 'MANUAL' ? 'text-[#1f5333]' : 'text-gray-600'}`}>
                    Thủ công
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Giáo viên tự bấm chuyển câu khi thấy thích hợp.
                </p>
              </button>

              <button
                onClick={() => setMode('AUTO')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  mode === 'AUTO'
                    ? 'border-[#8BC34A] bg-[#8BC34A]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Clock className={`w-4 h-4 ${mode === 'AUTO' ? 'text-[#8BC34A]' : 'text-gray-400'}`} />
                  <span className={`font-bold ${mode === 'AUTO' ? 'text-[#1f5333]' : 'text-gray-600'}`}>
                    Tự động
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Tự động chuyển câu khi hết giờ hoặc xong bài.
                </p>
              </button>
            </div>
          </div>

          {mode === 'AUTO' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Thời gian làm mỗi câu (giây)
                </label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={questionTime}
                  onChange={(e) => setQuestionTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8BC34A]/50 focus:border-[#8BC34A]"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 block mb-1">
                  Thời gian hiện Bảng xếp hạng giữa các câu (giây)
                </label>
                <input
                  type="number"
                  min="3"
                  max="30"
                  value={leaderboardTime}
                  onChange={(e) => setLeaderboardTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-[#8BC34A]/50 focus:border-[#8BC34A]"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0">
          <Button onClick={handleStart} className="w-full bg-[#8BC34A] hover:bg-[#7CB342] text-white py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all font-bold">
            <PlayCircle className="w-6 h-6 mr-2" /> Bắt đầu ngay
          </Button>
        </div>
      </div>
    </div>
  );
}

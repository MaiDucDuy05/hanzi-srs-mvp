'use client';

import { useEffect, useState } from 'react';
import { resourceApi } from '@/lib/api/endpoints';
import type { User } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { 
  Sparkles, 
  User as UserIcon,
  BookOpen,
  TrendingUp,
  AlertCircle,
  Volume2,
  Edit2
} from 'lucide-react';

export function TeacherStudentsFeature() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const us = await resourceApi.listUsers({});
        if (cancelled) return;
        // Lọc ra các học viên (Role không phải ADMIN hay TEACHER)
        const studentList = us.filter(u => u.role !== 'ADMIN' && u.role !== 'TEACHER');
        setStudents(studentList);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải danh sách học viên.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoading label="Đang tải dữ liệu học viên..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  // Hàm lấy Initials từ tên (VD: Lê Văn Học -> LVH -> LH)
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[34px] font-extrabold text-[#1f5333] tracking-tight mb-2">Student Progress</h1>
        <p className="text-[15px] text-gray-500 font-medium">Class: Little Shoots (Beginner)</p>
      </div>

      {/* AI Path Suggestion */}
      <div className="bg-[#fcfce8] border border-[#eaf3c5] rounded-[24px] p-8 mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-start gap-5 relative z-10">
          <div className="h-14 w-14 bg-[#1f5333] rounded-full flex items-center justify-center text-white shrink-0 shadow-md">
            <Sparkles className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-[#1f5333] mb-2">AI Path Suggestion</h2>
            <p className="text-[14px] text-gray-600 font-medium leading-relaxed max-w-2xl">
              <span className="font-bold text-[#1f5333]">Student A ({students[0]?.fullName || 'Xiao Ming'})</span> has maintained a 95% vocabulary retention rate and passed the internal assessment. They are ready for HSK 2. Suggest moving them to the next level module.
            </p>
          </div>
        </div>
        <button className="bg-white border border-[#c7cf35] text-[#1f5333] px-6 py-2.5 rounded-full text-[13px] font-bold shadow-sm hover:bg-[#f3f4e1] transition-colors whitespace-nowrap shrink-0 relative z-10">
          Apply Path Update
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        
        {/* Left Column: Active Students */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-6 text-[#4a5a3a]">
            <UserIcon className="h-5 w-5" strokeWidth={2.5} />
            <h2 className="font-bold text-[16px]">Active Students</h2>
          </div>

          <div className="space-y-6">
            {students.length > 0 ? students.map((student, index) => {
              // Mock stats based on index
              const testAvg = Math.max(60, 95 - index * 5);
              const completion = Math.max(20, 85 - index * 10);
              const vocabMastery = Math.max(50, 95 - index * 8);

              return (
                <div key={student.id} className="bg-white rounded-[24px] p-6 border border-[#eaf3c5] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#1f5333] font-extrabold text-lg shadow-inner">
                        {getInitials(student.fullName)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#1f5333] text-lg mb-1">{student.fullName}</h3>
                        <div className="flex items-center gap-2">
                          <span className="bg-[#c7cf35] text-[#1f5333] px-2 py-0.5 rounded text-[10px] font-extrabold tracking-wide uppercase">HSK 1</span>
                          <span className="text-[12px] text-gray-500 font-medium">Completion: {completion}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-extrabold text-[#1f5333]">{testAvg}%</div>
                      <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Test Avg</div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex justify-between text-[11px] font-bold text-[#1f5333] mb-2">
                      <span>Course Progress</span>
                      <span>{completion}%</span>
                    </div>
                    <div className="h-2 w-full bg-[#eaf3c5] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1f5333] rounded-full" 
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-[#78993a]">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-[12px] font-bold">Vocab Mastery (FSRS): {vocabMastery}%</span>
                    </div>
                    <button className="text-[12px] font-bold text-[#1f5333] hover:text-[#78993a] transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-sm italic">Chưa có học viên nào trong danh sách.</p>
            )}
          </div>
        </div>

        {/* Right Column: Error Notebook */}
        <div className="w-full xl:w-[350px] shrink-0 xl:sticky xl:top-4 xl:self-start">
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <BookOpen className="h-6 w-6 text-[#e55353]" strokeWidth={2.5} />
              <h2 className="font-extrabold text-xl text-[#1f5333]">Error Notebook</h2>
            </div>
            
            <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-5">
              CLASS COMMON MISTAKES
            </h3>

            <div className="space-y-4 mb-8">
              
              {/* Mistake 1 */}
              <div className="bg-[#fff4f4] rounded-2xl p-5 border border-[#ffd5d5]">
                <div className="flex items-center gap-2 text-[#e55353] mb-2">
                  <Volume2 className="h-4 w-4" />
                  <h4 className="font-bold text-[13px]">z / zh / c confusion</h4>
                </div>
                <p className="text-[12px] text-gray-600 font-medium">
                  45% of class struggles with pronunciation differentiation.
                </p>
              </div>

              {/* Mistake 2 */}
              <div className="bg-[#fcfce8] rounded-2xl p-5 border border-[#eaf3c5]">
                <div className="flex items-center gap-2 text-[#78993a] mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <h4 className="font-bold text-[13px]">Tone 3 Sandhi</h4>
                </div>
                <p className="text-[12px] text-gray-600 font-medium">
                  Frequently forgetting to change first 3rd tone to 2nd tone.
                </p>
              </div>

              {/* Mistake 3 */}
              <div className="bg-[#f0f2f5] rounded-2xl p-5 border border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <Edit2 className="h-4 w-4" />
                  <h4 className="font-bold text-[13px]">Stroke Order: '女'</h4>
                </div>
                <p className="text-[12px] text-gray-600 font-medium">
                  Common error in writing sequence.
                </p>
              </div>

            </div>

            <button className="w-full bg-white border-2 border-gray-100 text-[#1f5333] px-4 py-3 rounded-full text-[13px] font-bold hover:bg-gray-50 hover:border-gray-200 transition-all shadow-sm">
              View Full Error Log
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

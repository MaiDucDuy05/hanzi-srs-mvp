import type { Student } from '../types';
import { clampPct, getInitials } from '../utils';

export function StudentCard({ student, onClick }: { student: Student; onClick: (s: Student) => void }) {
  const testAvg = clampPct(student.testAvg);
  const completion = clampPct(student.courseProgress);
  const vocabMastery = clampPct(student.vocabMastery);
  const name = student.fullName?.trim() || 'Unnamed Student';

  return (
    <button
      type="button"
      onClick={() => onClick(student)}
      className="w-full bg-white rounded-[24px] p-6 border border-[#eaf3c5] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 hover:border-[#c7cf35] transition-all duration-300 text-left"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-[#f3f4e1] flex items-center justify-center text-[#1f5333] font-extrabold text-lg shadow-inner">
            {getInitials(student.fullName)}
          </div>
          <div>
            <h3 className="font-extrabold text-[#1f5333] text-lg mb-1">{name}</h3>
            <div className="flex items-center gap-2">
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
          <div className="h-full bg-[#1f5333] rounded-full transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-[#78993a]">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="text-[12px] font-bold">Vocab Mastery (FSRS): {vocabMastery}%</span>
        </div>
        <span className="text-[12px] font-bold text-[#78993a]">Xem chi tiết →</span>
      </div>
    </button>
  );
}

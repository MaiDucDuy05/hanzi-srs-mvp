import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { testAssignmentsApi } from '@/lib/api/endpoints/test-assignments';
import { testApi } from '@/lib/api/endpoints/test';
import { usersApi } from '@/lib/api/endpoints/users';
import type { User, Test } from '@/lib/api/types';
import { Send, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { AssignExamScheduleCard } from './assign-exam-schedule-card';
import { AssignExamStudentPicker } from './assign-exam-student-picker';

interface ExamAssignModalProps {
  open: boolean;
  onClose: () => void;
  testId: string | null;
}

export function ExamAssignModal({ open, onClose, testId }: ExamAssignModalProps) {
  const [test, setTest] = useState<Test | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusOnSubmit, setStatusOnSubmit] = useState<'GRADED' | 'SUBMITTED'>('GRADED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setError(null);
      setSearchTerm('');
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartTime(now.toISOString().slice(0, 16));
      const later = new Date(now);
      later.setHours(later.getHours() + 24);
      setEndTime(later.toISOString().slice(0, 16));

      if (testId) {
        testApi.get(testId).then(setTest).catch(() => setTest(null));
      }
      usersApi.getAll({ role: 'FREE', limit: 100 })
        .then((res) => setStudents(res.data))
        .catch((err) => console.error('Could not load students', err));
    } else {
      setSelectedStudentIds([]);
      setTest(null);
    }
  }, [open, testId]);

  const handleApplyPreset = (hours: number) => {
    const base = startTime ? new Date(startTime) : new Date();
    setEndTime(new Date(base.getTime() + hours * 3600000).toISOString().slice(0, 16));
  };

  const handleToggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const q = searchTerm.toLowerCase().trim();
    const visibleStudents = students.filter(
      (s) => !q || (s.fullName || '').toLowerCase().includes(q) || (s.email || '').toLowerCase().includes(q)
    );
    const visibleIds = visibleStudents.map((s) => s.id);
    const isAllSelected = visibleIds.every((id) => selectedStudentIds.includes(id));
    setSelectedStudentIds((prev) =>
      isAllSelected ? prev.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds]))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;
    if (selectedStudentIds.length === 0) {
      setError('Vui lòng chọn ít nhất một học sinh để giao bài.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await testAssignmentsApi.create({
        testId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        studentIds: selectedStudentIds,
        classroomId: null,
        statusOnSubmit,
      });
      setSuccess(true);
      setTimeout(onClose, 1200);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi giao bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide={true}
      title={
        <div className="flex items-center gap-2.5 text-[#1f5333]">
          <div className="w-8 h-8 rounded-xl bg-[#1f5333]/10 flex items-center justify-center text-[#1f5333]">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-base sm:text-lg">Giao bài kiểm tra</h2>
            <p className="text-xs text-gray-500 font-normal">Thiết lập thời hạn làm bài và chọn học sinh tham gia</p>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {test && (
          <div className="p-3.5 bg-gradient-to-r from-[#f4f7ed] to-[#eef5e9] rounded-2xl border border-[#dde8a6] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#1f5333] text-white flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1f5333] truncate">{test.name}</h3>
                  {test.hskLevel && (
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-white text-[#78993a] border border-[#78993a]/30">
                      HSK {test.hskLevel}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#78993a]" /> {test.timeLimitMinutes} phút
                  </span>
                  <span>• {test.attemptLimit || 1} lần làm</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>Đã giao bài kiểm tra thành công cho {selectedStudentIds.length} học sinh!</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-6">
            <AssignExamScheduleCard
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              statusOnSubmit={statusOnSubmit}
              setStatusOnSubmit={setStatusOnSubmit}
              onApplyPreset={handleApplyPreset}
            />
          </div>

          <div className="md:col-span-6">
            <AssignExamStudentPicker
              students={students}
              selectedStudentIds={selectedStudentIds}
              onToggleStudent={handleToggleStudent}
              onToggleSelectAll={handleToggleSelectAll}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            Đã chọn: <strong className="text-[#1f5333] font-bold">{selectedStudentIds.length}</strong> học sinh
          </span>
          <div className="flex items-center gap-2.5 ml-auto">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>Hủy</Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading || success || selectedStudentIds.length === 0}
              className="bg-[#1f5333] hover:bg-[#184228] text-white px-5 rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{selectedStudentIds.length > 0 ? `Giao cho ${selectedStudentIds.length} học sinh` : 'Giao bài'}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

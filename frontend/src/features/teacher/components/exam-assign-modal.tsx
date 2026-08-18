import { useState, useEffect } from 'react';
import { Modal } from '@/features/ui/components/modal';
import { Button } from '@/features/ui/components/button';
import { Input, Field } from '@/features/ui/components/form';
import { testAssignmentsApi } from '@/lib/api/endpoints/test-assignments';
import { usersApi } from '@/lib/api/endpoints/users';
import type { User } from '@/lib/api/types';

interface ExamAssignModalProps {
  open: boolean;
  onClose: () => void;
  testId: string | null;
}

export function ExamAssignModal({ open, onClose, testId }: ExamAssignModalProps) {
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [students, setStudents] = useState<User[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [statusOnSubmit, setStatusOnSubmit] = useState<'GRADED' | 'SUBMITTED'>('GRADED');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      usersApi.getAll({ role: 'FREE', limit: 100 })
        .then(res => setStudents(res.data))
        .catch(err => console.error("Could not load students", err));
    } else {
      setSelectedStudentIds([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await testAssignmentsApi.create({
        testId,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        studentIds: selectedStudentIds,
        classroomId: null, // MVP: skipping class selection for now
        statusOnSubmit,
      });
      alert('Giao bài kiểm tra thành công!');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi giao bài kiểm tra');
    } finally {
      setLoading(false);
    }
  };

  // Setup default times when opening modal
  const handleOpen = () => {
    if (open && !startTime) {
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartTime(now.toISOString().slice(0, 16));
      
      const later = new Date(now);
      later.setHours(later.getHours() + 1);
      setEndTime(later.toISOString().slice(0, 16));
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Giao bài kiểm tra"
    >
      <form onSubmit={handleSubmit} className="space-y-4" onFocus={handleOpen}>
        {error && <div className="p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
        
        <p className="text-sm text-gray-600">
          Học sinh chỉ có thể làm bài trong khoảng thời gian bạn cài đặt.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Thời gian bắt đầu">
            <Input 
              type="datetime-local" 
              required 
              value={startTime} 
              onChange={e => setStartTime(e.target.value)} 
            />
          </Field>
          <Field label="Thời gian kết thúc">
            <Input 
              type="datetime-local" 
              required 
              value={endTime} 
              onChange={e => setEndTime(e.target.value)} 
            />
          </Field>
        </div>

        <Field label="Chế độ chấm điểm">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="statusOnSubmit"
                value="GRADED"
                checked={statusOnSubmit === 'GRADED'}
                onChange={() => setStatusOnSubmit('GRADED')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm">Tự động chấm</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="statusOnSubmit"
                value="SUBMITTED"
                checked={statusOnSubmit === 'SUBMITTED'}
                onChange={() => setStatusOnSubmit('SUBMITTED')}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm">Chờ giáo viên chấm (Thủ công)</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Chọn "Tự động chấm" nếu bài thi chỉ có trắc nghiệm. 
            Chọn "Chờ giáo viên chấm" nếu bài thi có phần tự luận hoặc nói.
          </p>
        </Field>

        <Field label="Chọn Học sinh">
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="bg-gray-50 px-4 py-2 border-b flex items-center gap-3">
              <input
                type="checkbox"
                id="select-all"
                checked={students.length > 0 && selectedStudentIds.length === students.length}
                onChange={e => {
                  if (e.target.checked) {
                    setSelectedStudentIds(students.map(s => s.id));
                  } else {
                    setSelectedStudentIds([]);
                  }
                }}
                className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
              <label htmlFor="select-all" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Chọn tất cả ({students.length})
              </label>
            </div>
            <div className="max-h-48 overflow-y-auto p-2 space-y-1">
              {students.length === 0 ? (
                <p className="text-xs text-gray-500 p-2 text-center">Không tìm thấy học sinh nào.</p>
              ) : (
                students.map(student => (
                  <label key={student.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedStudentIds([...selectedStudentIds, student.id]);
                        } else {
                          setSelectedStudentIds(selectedStudentIds.filter(id => id !== student.id));
                        }
                      }}
                      className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div>
                      <div className="text-sm font-medium">{student.fullName}</div>
                      <div className="text-xs text-gray-500">{student.email}</div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">Chọn những học sinh sẽ được giao bài kiểm tra này.</p>
        </Field>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>Hủy</Button>
          <Button type="submit" loading={loading}>Xác nhận Giao</Button>
        </div>
      </form>
    </Modal>
  );
}

import React from 'react';
import { Search, Users, Check, User as UserIcon } from 'lucide-react';
import type { User } from '@/lib/api/types';
import { cn } from '@/lib/utils/cn';

interface AssignExamStudentPickerProps {
  students: User[];
  selectedStudentIds: string[];
  onToggleStudent: (id: string) => void;
  onToggleSelectAll: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export function AssignExamStudentPicker({
  students,
  selectedStudentIds,
  onToggleStudent,
  onToggleSelectAll,
  searchTerm,
  setSearchTerm,
}: AssignExamStudentPickerProps) {
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (s.fullName || '').toLowerCase().includes(q) ||
      (s.email || '').toLowerCase().includes(q)
    );
  });

  const isAllSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((s) => selectedStudentIds.includes(s.id));

  // Tạo màu ngẫu nhiên hài hòa cho avatar
  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-emerald-100 text-emerald-700',
      'bg-teal-100 text-teal-700',
      'bg-lime-100 text-lime-800',
      'bg-cyan-100 text-cyan-700',
      'bg-amber-100 text-amber-800',
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header with Search */}
      <div className="p-3.5 border-b border-gray-100 bg-gray-50/70 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-[#1f5333]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#1f5333]">
              Danh sách học sinh
            </span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#1f5333]/10 text-[#1f5333]">
            {selectedStudentIds.length} / {students.length}
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#78993a] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Select all bar */}
      <div className="px-3.5 py-2 bg-[#fcfdfa] border-b border-gray-100 flex items-center justify-between">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onToggleSelectAll}
            className="w-4 h-4 rounded text-[#1f5333] border-gray-300 focus:ring-[#78993a] cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700">
            {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả kết quả'}
          </span>
        </label>
        <span className="text-[11px] text-gray-400 font-medium">
          {filteredStudents.length} học sinh phù hợp
        </span>
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[300px] sm:max-h-[340px]">
        {filteredStudents.length === 0 ? (
          <div className="p-6 text-center text-gray-400">
            <UserIcon className="w-8 h-8 mx-auto mb-1.5 opacity-40" />
            <p className="text-xs font-medium">Không tìm thấy học sinh nào</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isSelected = selectedStudentIds.includes(student.id);
            const initial = (student.fullName || student.email || '?')
              .trim()
              .charAt(0)
              .toUpperCase();
            return (
              <div
                key={student.id}
                onClick={() => onToggleStudent(student.id)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border',
                  isSelected
                    ? 'bg-[#f4f7ed]/70 border-[#dde8a6]'
                    : 'bg-white border-transparent hover:bg-gray-50'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0',
                      getAvatarColor(student.fullName || student.email)
                    )}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {student.fullName || 'Học viên'}
                    </p>
                    <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                  </div>
                </div>

                <div
                  className={cn(
                    'w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0',
                    isSelected
                      ? 'bg-[#1f5333] border-[#1f5333] text-white'
                      : 'border-gray-300 bg-white'
                  )}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

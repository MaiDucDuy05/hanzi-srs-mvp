/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef } from 'react';
import { X, UploadCloud, Download, Trash2, CheckCircle2, AlertCircle, FileText, Puzzle } from 'lucide-react';
import { adminContentApi } from '@/lib/api/endpoints/admin-content';

interface BulkAddPracticeQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  hskLevels: any[];
}

interface ParsedQuestionRow {
  prompt: string;
  questionType: 'FILL_BLANK' | 'SENTENCE_ORDERING';
  answerType: 'TEXT' | 'HANZI' | 'PINYIN';
  choicesRaw: string;
  answerRaw: string;
  levelId: string;
  levelName?: string;
  translation: string;
  explanation: string;
  isValid: boolean;
  errorMessage?: string;
}

export const BulkAddPracticeQuestionsModal = ({
  isOpen,
  onClose,
  onSuccess,
  hskLevels,
}: BulkAddPracticeQuestionsModalProps) => {
  const [rows, setRows] = useState<ParsedQuestionRow[]>([]);
  const [defaultLevelId, setDefaultLevelId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // RFC-4180 compliant CSV parser
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let curRow: string[] = [];
    let curCell = '';
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (insideQuote && text[i + 1] === '"') {
          curCell += '"';
          i++; // skip escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === ',' && !insideQuote) {
        curRow.push(curCell);
        curCell = '';
      } else if ((c === '\n' || c === '\r') && !insideQuote) {
        if (c === '\r' && text[i + 1] === '\n') i++;
        curRow.push(curCell);
        if (curRow.some((cell) => cell.trim())) {
          lines.push(curRow);
        }
        curRow = [];
        curCell = '';
      } else {
        curCell += c;
      }
    }
    if (curCell || curRow.length) {
      curRow.push(curCell);
      if (curRow.some((cell) => cell.trim())) {
        lines.push(curRow);
      }
    }
    return lines;
  };

  const handleDownloadSample = () => {
    const sampleCsv = `prompt,question_type,answer_type,choices,answer,hsk_level,translation,explanation
"他___中国人。","FILL_BLANK","TEXT","是;不;有;在","是","HSK 1","Anh ấy là người Trung Quốc.","Chọn 是 làm vị ngữ chỉ danh tính"
"Sắp xếp các từ thành câu hoàn chỉnh","SENTENCE_ORDERING","TEXT","","我,喜,欢,喝,茶","HSK 1","Tôi thích uống trà.","Thứ tự: Chủ ngữ + Động từ + Tân ngữ"
"___是老师。","FILL_BLANK","TEXT","他;的;吗;了","他","HSK 1","Anh ấy là giáo viên.","Đại từ nhân xưng làm chủ ngữ"`;

    const blob = new Blob(['\uFEFF' + sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample_practice_questions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      let text = evt.target?.result as string;
      if (!text) return;

      if (text.charCodeAt(0) === 0xfeff) {
        text = text.slice(1);
      }

      const parsedLines = parseCSV(text);
      if (parsedLines.length === 0) {
        alert('File CSV không có dữ liệu!');
        return;
      }

      // Check header
      const header = parsedLines[0].map((s) => s.toLowerCase().trim());
      const hasHeader =
        header.includes('prompt') ||
        header.includes('đề bài') ||
        header.includes('câu hỏi') ||
        header.includes('question_type');

      const dataRows = hasHeader ? parsedLines.slice(1) : parsedLines;

      const parsedList: ParsedQuestionRow[] = dataRows.map((r) => {
        const prompt = r[0]?.trim() || '';
        let questionType: 'FILL_BLANK' | 'SENTENCE_ORDERING' = 'FILL_BLANK';
        const typeRaw = r[1]?.toUpperCase()?.trim();
        if (typeRaw === 'SENTENCE_ORDERING' || typeRaw === 'ORDERING' || typeRaw === 'SAP_XEP') {
          questionType = 'SENTENCE_ORDERING';
        }

        const answerTypeRaw = r[2]?.toUpperCase()?.trim();
        const answerType: 'TEXT' | 'HANZI' | 'PINYIN' =
          answerTypeRaw === 'HANZI' || answerTypeRaw === 'PINYIN' ? answerTypeRaw : 'TEXT';

        const choicesRaw = r[3]?.trim() || '';
        const answerRaw = r[4]?.trim() || '';
        const hskStr = r[5]?.trim() || '';
        const translation = r[6]?.trim() || '';
        const explanation = r[7]?.trim() || '';

        // Match HSK level
        let matchedLevel = hskLevels.find(
          (l) =>
            l.name?.toLowerCase() === hskStr.toLowerCase() ||
            `hsk ${l.level}`.toLowerCase() === hskStr.toLowerCase() ||
            l.level?.toString() === hskStr ||
            l.id === hskStr,
        );

        if (!matchedLevel && defaultLevelId) {
          matchedLevel = hskLevels.find((l) => l.id === defaultLevelId);
        }

        const finalLevelId = matchedLevel?.id || defaultLevelId || '';
        const finalLevelName = matchedLevel?.name || (finalLevelId ? `HSK Level` : 'Chưa chọn');

        // Validation
        let isValid = true;
        let errorMessage = '';

        if (!prompt) {
          isValid = false;
          errorMessage = 'Thiếu đề bài (prompt)';
        } else if (!answerRaw) {
          isValid = false;
          errorMessage = 'Thiếu đáp án đúng (answer)';
        } else if (questionType === 'FILL_BLANK' && !choicesRaw && !answerRaw) {
          isValid = false;
          errorMessage = 'Cần ít nhất 1 đáp án hoặc lựa chọn';
        }

        return {
          prompt,
          questionType,
          answerType,
          choicesRaw,
          answerRaw,
          levelId: finalLevelId,
          levelName: finalLevelName,
          translation,
          explanation,
          isValid,
          errorMessage,
        };
      });

      setRows((prev) => [...prev, ...parsedList]);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.readAsText(file);
  };

  const handleRemoveRow = (index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      alert('Không có câu hỏi hợp lệ nào để lưu!');
      return;
    }

    try {
      setSaving(true);
      const payloads = validRows.map((r) => {
        let questionData: any = {};
        let answerData: any = {};
        let acceptedAnswers: any = {};

        if (r.questionType === 'FILL_BLANK') {
          let choices = r.choicesRaw
            .split(/[,;]/)
            .map((s) => s.trim())
            .filter(Boolean);

          // If answer is not in choices, add it
          if (r.answerRaw && !choices.includes(r.answerRaw)) {
            choices = [r.answerRaw, ...choices];
          }

          const blankIndex = choices.indexOf(r.answerRaw) >= 0 ? choices.indexOf(r.answerRaw) : 0;

          questionData = { choices, withHanzi: true };
          answerData = { answer: r.answerRaw, blankIndex };
          acceptedAnswers = { list: [r.answerRaw] };
        } else {
          // SENTENCE_ORDERING
          const words = r.answerRaw.includes(',')
            ? r.answerRaw.split(',').map((s) => s.trim()).filter(Boolean)
            : r.answerRaw.split(/\s+/).map((s) => s.trim()).filter(Boolean);

          const tokens = words.map((w, idx) => ({ id: `t${idx + 1}`, text: w }));
          const orderedTokenIds = tokens.map((t) => t.id);

          questionData = { tokens };
          answerData = { orderedTokenIds };
          acceptedAnswers = { list: orderedTokenIds };
        }

        return {
          prompt: r.prompt,
          questionType: r.questionType,
          answerType: r.answerType,
          questionData,
          answerData,
          acceptedAnswers,
          levelId: r.levelId || defaultLevelId || null,
          translation: r.translation || null,
          explanation: r.explanation || null,
          status: 'PUBLISHED',
          isActive: true,
        };
      });

      // Single bulk create API call
      await adminContentApi.bulkCreateQuestions(payloads);

      alert(`Đã thêm thành công ${payloads.length} câu hỏi luyện tập!`);
      onSuccess();
    } catch (error) {
      console.error('Lỗi khi import câu hỏi:', error);
      alert('Có lỗi xảy ra khi lưu câu hỏi. Vui lòng kiểm tra lại!');
    } finally {
      setSaving(false);
    }
  };

  const validCount = rows.filter((r) => r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50/50 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-[#11321e]">Import Câu Hỏi Luyện Tập từ CSV</h2>
            <p className="text-sm text-gray-500 mt-1">
              Nhập hàng loạt câu hỏi dạng Điền từ (FILL_BLANK) hoặc Sắp xếp câu (SENTENCE_ORDERING).
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-6 border-b bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
              <span className="text-xs font-semibold text-gray-500">Gán HSK mặc định:</span>
              <select
                className="bg-white px-2 py-1 rounded-lg text-sm font-bold border border-gray-200 outline-none focus:ring-2 focus:ring-[#c7cf35] text-[#11321e]"
                value={defaultLevelId}
                onChange={(e) => {
                  const newLvl = e.target.value;
                  setDefaultLevelId(newLvl);
                  // Update rows that have no custom level
                  setRows((prev) =>
                    prev.map((r) => ({
                      ...r,
                      levelId: r.levelId || newLvl,
                      levelName: r.levelId ? r.levelName : hskLevels.find((l) => l.id === newLvl)?.name || '',
                    })),
                  );
                }}
              >
                <option value="">-- Không gán mặc định --</option>
                {hskLevels.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.name || `HSK ${lvl.level}`}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              title="Tải file mẫu CSV"
            >
              <Download className="w-4 h-4" />
              Tải file mẫu CSV
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
            >
              <UploadCloud className="h-4 w-4" />
              Tải lên file CSV
            </button>
          </div>
        </div>

        {/* Content list / Preview */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50/30">
          {rows.length === 0 ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
              <UploadCloud className="w-12 h-12 text-gray-300 mb-3" />
              <p className="font-bold text-gray-700">Chưa có dữ liệu nào được tải lên</p>
              <p className="text-sm text-gray-400 mt-1 max-w-md">
                Nhấn <b>Tải file mẫu CSV</b> để xem định dạng chuẩn, sau đó nhấn <b>Tải lên file CSV</b> để xem trước các câu hỏi.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700">
                  Danh sách xem trước ({rows.length} câu hỏi):
                </span>
                <span className="text-xs font-medium text-gray-500">
                  <span className="text-green-600 font-bold">{validCount} hợp lệ</span> •{' '}
                  <span className="text-red-500 font-bold">{rows.length - validCount} lỗi</span>
                </span>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead className="bg-gray-100 text-gray-600 text-xs uppercase">
                    <tr>
                      <th className="p-3 w-10 text-center">#</th>
                      <th className="p-3 w-36">Loại câu hỏi</th>
                      <th className="p-3">Đề bài</th>
                      <th className="p-3">Lựa chọn / Từ vựng</th>
                      <th className="p-3">Đáp án</th>
                      <th className="p-3 w-24">HSK</th>
                      <th className="p-3 w-12 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((row, idx) => (
                      <tr key={idx} className={row.isValid ? 'hover:bg-gray-50/80' : 'bg-red-50/50'}>
                        <td className="p-3 text-center text-xs text-gray-400">{idx + 1}</td>
                        <td className="p-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              row.questionType === 'FILL_BLANK'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-emerald-50 text-emerald-700'
                            }`}
                          >
                            {row.questionType === 'FILL_BLANK' ? (
                              <FileText className="w-3 h-3" />
                            ) : (
                              <Puzzle className="w-3 h-3" />
                            )}
                            {row.questionType}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-gray-800">
                          {row.prompt}
                          {row.translation && (
                            <p className="text-xs text-gray-400 mt-0.5">{row.translation}</p>
                          )}
                          {!row.isValid && (
                            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                              <AlertCircle className="w-3 h-3" /> {row.errorMessage}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-gray-600 text-xs">
                          {row.choicesRaw ? (
                            <div className="flex flex-wrap gap-1">
                              {row.choicesRaw.split(/[,;]/).map((c, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                                  {c.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">-</span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-green-700 text-xs">
                          {row.answerRaw}
                        </td>
                        <td className="p-3 font-semibold text-gray-600 text-xs">
                          {row.levelName || '-'}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleRemoveRow(idx)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Xóa dòng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center shrink-0">
          <div className="text-xs text-gray-500">
            {rows.length > 0 && (
              <span>
                Sẵn sàng import <b>{validCount}</b> câu hỏi vào hệ thống.
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-6 py-2 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving || validCount === 0}
              className="flex items-center gap-2 px-6 py-2 rounded-xl font-bold bg-[#c7cf35] text-[#11321e] hover:bg-[#dde8a6] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving ? 'Đang lưu...' : `Nhập ${validCount} câu hỏi`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

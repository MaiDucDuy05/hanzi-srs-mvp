import { useState, useEffect } from 'react';
import type { Reward, RewardType, CreateRewardDto, UpdateRewardDto } from '@/lib/api/types';
import { X, Save, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  reward: Reward | null; // if null, it's create mode
}

export function AdminRewardsModal({ isOpen, onClose, onSave, reward }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<RewardType>('TEMPORARY_VIP');
  const [costExp, setCostExp] = useState(100);
  const [active, setActive] = useState(true);
  const [metadataJson, setMetadataJson] = useState('{\n  \n}');

  useEffect(() => {
    if (isOpen) {
      if (reward) {
        setCode(reward.code);
        setTitle(reward.title);
        setType(reward.type);
        setCostExp(reward.costExp);
        setActive(reward.active);
        setMetadataJson(reward.metadata ? JSON.stringify(reward.metadata, null, 2) : '{\n  \n}');
      } else {
        setCode('');
        setTitle('');
        setType('TEMPORARY_VIP');
        setCostExp(100);
        setActive(true);
        setMetadataJson('{\n  "durationHours": 24,\n  "scope": []\n}');
      }
      setError(null);
    }
  }, [isOpen, reward]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !title || costExp < 1) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc (Code, Tên, Giá EXP > 0)');
      return;
    }

    let parsedMetadata = null;
    try {
      if (metadataJson.trim() !== '') {
        parsedMetadata = JSON.parse(metadataJson);
      }
    } catch (err) {
      setError('Metadata không phải là JSON hợp lệ.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = {
        code, // Only used in create
        title,
        type,
        costExp,
        active,
        metadata: parsedMetadata,
      };
      await onSave(data);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi lưu phần thưởng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-forest">
            {reward ? 'Sửa phần thưởng' : 'Thêm phần thưởng mới'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form id="reward-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mã (Code) *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={!!reward} // Cannot edit code after creation
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#85d038] disabled:bg-gray-100 disabled:text-gray-500"
                placeholder="VD: VIP_1_DAY"
              />
              {!reward && <p className="text-xs text-gray-500 mt-1">Mã không thể thay đổi sau khi tạo.</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tên hiển thị *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#85d038]"
                placeholder="VD: Thẻ VIP 1 Ngày"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Loại phần thưởng</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as RewardType)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#85d038] bg-white"
                >
                  <option value="TEMPORARY_VIP">Gói VIP thời vụ</option>
                  <option value="DISCOUNT_VOUCHER">Mã giảm giá</option>
                  <option value="CONTENT_UNLOCK">Mở khóa nội dung</option>
                  <option value="COSMETIC">Đồ trang trí</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá EXP *</label>
                <input
                  type="number"
                  min="1"
                  value={costExp}
                  onChange={(e) => setCostExp(Number(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#85d038]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Trạng thái</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-[#85d038] rounded focus:ring-[#85d038]"
                />
                <span className="text-sm text-gray-700">Mở bán (Active)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cấu hình (Metadata - JSON)</label>
              <textarea
                value={metadataJson}
                onChange={(e) => setMetadataJson(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-[#85d038] font-mono text-sm"
                placeholder='{"durationHours": 24}'
              />
              <p className="text-xs text-gray-500 mt-1">
                JSON hợp lệ. Ví dụ VIP: {`{"durationHours": 24, "scope": []}`}
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="reward-form"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-forest rounded-xl hover:bg-forest/90 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

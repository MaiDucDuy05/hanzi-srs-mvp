'use client';

import { useEffect, useState } from 'react';
import { resourceApi, subscriptionApi } from '@/lib/api/endpoints';
import type { Resource } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { Modal } from '@/features/ui/components/modal';
import { Field, Input, Select, Textarea } from '@/features/ui/components/form';
import { Button } from '@/features/ui/components/button';
import { 
  Library, 
  UploadCloud, 
  FileText, 
  FileVideo, 
  File, 
  MoreVertical,
  Settings,
  Gamepad2,
  Hourglass,
  ChevronDown
} from 'lucide-react';

export function AdminResourcesFeature() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isVip, setIsVip] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', fileKey: '', tier: 'FREE' as 'FREE' | 'VIP', status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await resourceApi.list({ status: 'PUBLISHED' });
        if (cancelled) return;
        setResources(list.filter((r) => !r.deletedAt));
        
        const vipRole = user?.role === 'TEACHER' || user?.role === 'ADMIN';
        let vipActive = false;
        if (!vipRole) {
          try {
            const me = await subscriptionApi.me();
            vipActive =
              !!me && me.plan === 'VIP' && me.status === 'ACTIVE' &&
              (!me.expiresAt || new Date(me.expiresAt) > new Date());
          } catch {
            vipActive = false;
          }
        }
        if (cancelled) return;
        setIsVip(vipRole || vipActive);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Lỗi tải tài liệu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleCreate = async () => {
    if (!createForm.title || !createForm.fileKey) {
      window.alert('Vui lòng nhập đủ tên và đường dẫn file');
      return;
    }
    try {
      setCreating(true);
      const newRes = await resourceApi.create(createForm);
      setResources([newRes, ...resources]);
      setIsModalOpen(false);
      setCreateForm({ title: '', description: '', fileKey: '', tier: 'FREE', status: 'PUBLISHED' });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi tạo tài liệu');
    } finally {
      setCreating(false);
    }
  };

  const getFileIcon = (title: string, fileKey: string) => {
    const name = (title + fileKey).toLowerCase();
    if (name.includes('.mp4') || name.includes('.avi') || name.includes('.mov')) return <FileVideo className="h-5 w-5 text-gray-500" />;
    if (name.includes('.pdf') || name.includes('.ppt') || name.includes('.doc')) return <FileText className="h-5 w-5 text-gray-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const freeResources = resources.filter(r => r.tier === 'FREE');
  const vipResources = resources.filter(r => r.tier === 'VIP');

  if (loading) return <PageLoading label="Đang tải tài liệu..." />;
  if (error) return <ErrorState message={error} onRetry={() => location.reload()} />;

  return (
    <AuthGuard>
      <div className="space-y-10 pb-10 max-w-[1000px]">
        
        {/* Top Header */}
        <div className="mb-10">
        <h1 className="text-[28px] leading-tight font-extrabold text-[#11321e] mb-2">
          Tài nguyên Toàn cầu & Cài đặt Hệ thống
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Quản lý tài liệu học tập và cấu hình thông số hệ thống cốt lõi.
        </p>
      </div>

      {/* Global Library Card */}
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3 text-[#11321e]">
            <Library className="h-6 w-6 text-[#78993a]" strokeWidth={2.5} />
            <h2 className="text-xl font-bold">Thư viện Toàn cầu (Global Library)</h2>
          </div>
          {user?.role === 'ADMIN' && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#11321e] text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-[#1f4e31] transition-colors shadow-sm flex items-center gap-2"
            >
              <UploadCloud className="h-4 w-4" strokeWidth={2.5} />
              Tải lên Tài liệu
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Free Tier */}
          <div className="bg-[#fcfbe8] rounded-[20px] p-6 border border-[#f3f4e1]">
            <div className="flex items-center gap-2 mb-6">
              <span className="h-2 w-2 rounded-full bg-[#78993a]"></span>
              <h3 className="font-bold text-[#4a5a3a] text-sm">Tài liệu Cấp độ Cơ bản (Free Tier)</h3>
            </div>
            
            <div className="space-y-4">
              {freeResources.map(res => (
                <div key={res.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                      {getFileIcon(res.title, res.fileKey)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-gray-800 truncate">{res.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">2.4 MB • Cập nhật: Hôm nay</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {freeResources.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-4">Chưa có tài liệu cơ bản.</p>
              )}
            </div>
          </div>

          {/* VIP Tier */}
          <div className="bg-[#eaf3c5] rounded-[20px] p-6 border border-[#dde8a6]">
            <div className="flex items-center gap-2 mb-6">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#a3e670" stroke="#78993a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <h3 className="font-bold text-[#4a5a3a] text-sm">Tài liệu Cấp độ Cao cấp (VIP Tier)</h3>
            </div>

            <div className="space-y-4">
              {vipResources.map(res => (
                <div key={res.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
                      {getFileIcon(res.title, res.fileKey)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-gray-800 truncate">{res.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">45 MB • Cập nhật: Tuần trước</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-700 transition-colors shrink-0">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              ))}
              {vipResources.length === 0 && (
                <p className="text-xs text-gray-500 italic text-center py-4">Chưa có tài liệu VIP.</p>
              )}
            </div>
          </div>

        </div>
      </div>


      {/* Admin Create Modal */}
      {user?.role === 'ADMIN' && (
        <Modal 
          open={isModalOpen} 
          onClose={() => !creating && setIsModalOpen(false)} 
          title="Đăng tài liệu mới"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={creating}>Hủy</Button>
              <Button onClick={handleCreate} disabled={creating}>{creating ? 'Đang đăng...' : 'Đăng'}</Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Tên tài liệu (*)">
              <Input value={createForm.title} onChange={e => setCreateForm({...createForm, title: e.target.value})} disabled={creating} />
            </Field>
            <Field label="Mô tả">
              <Textarea value={createForm.description} onChange={e => setCreateForm({...createForm, description: e.target.value})} disabled={creating} />
            </Field>
            <Field label="URL/Đường dẫn (*)">
              <Input value={createForm.fileKey} onChange={e => setCreateForm({...createForm, fileKey: e.target.value})} disabled={creating} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại tài liệu">
                <Select value={createForm.tier} onChange={e => setCreateForm({...createForm, tier: e.target.value as 'FREE'|'VIP'})} disabled={creating}>
                  <option value="FREE">Miễn phí</option>
                  <option value="VIP">VIP</option>
                </Select>
              </Field>
              <Field label="Trạng thái">
                <Select value={createForm.status} onChange={e => setCreateForm({...createForm, status: e.target.value as 'DRAFT'|'PUBLISHED'})} disabled={creating}>
                  <option value="PUBLISHED">Công khai (Published)</option>
                  <option value="DRAFT">Nháp (Draft)</option>
                </Select>
              </Field>
            </div>
          </div>
        </Modal>
      )}

    </div>
    </AuthGuard>
  );
}

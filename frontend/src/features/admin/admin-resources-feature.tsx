'use client';

import { useEffect, useState } from 'react';
import { resourceApi, subscriptionApi } from '@/lib/api/endpoints';
import type { Resource } from '@/lib/api/types';
import { useAuth } from '@/lib/auth/auth-context';
import { AuthGuard } from '@/features/layout/components/auth-guard';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { useConfirm } from '@/providers/confirm-provider';
import { Modal } from '@/features/ui/components/modal';
import { DocumentViewerModal } from '@/features/ui/components/document-viewer-modal';
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
  const [createForm, setCreateForm] = useState({ title: '', description: '', tier: 'FREE' as 'FREE' | 'VIP', status: 'PUBLISHED' as 'DRAFT' | 'PUBLISHED' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<{ id: string; title: string; description: string; tier: 'FREE' | 'VIP'; status: 'DRAFT' | 'PUBLISHED' } | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [viewingItem, setViewingItem] = useState<any | null>(null);
  const confirm = useConfirm();

  const [viewerState, setViewerState] = useState<{ open: boolean; url: string; title: string; fileKey: string; tier: 'FREE'|'VIP' }>({
    open: false, url: '', title: '', fileKey: '', tier: 'FREE'
  });
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await resourceApi.list({});
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
    if (!createForm.title || !selectedFile) {
      window.alert('Vui lòng nhập đủ tên và chọn file tải lên');
      return;
    }
    try {
      setCreating(true);
      setUploadProgress(10);
      
      // 1. Get Presigned URL for Document
      const { uploadUrl, key } = await resourceApi.requestUploadUrl({ 
        fileName: selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'), 
        contentType: selectedFile.type || 'application/octet-stream'
      });
      setUploadProgress(30);

      // 2. Upload Document to S3 directly
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: { 'Content-Type': selectedFile.type || 'application/octet-stream' },
      });
      if (!uploadRes.ok) throw new Error('Không thể tải tài liệu lên máy chủ (AWS S3)');
      setUploadProgress(60);

      // 3. Upload Cover Image (if any)
      let coverKey: string | undefined = undefined;
      if (selectedCoverFile) {
        const coverReq = await resourceApi.requestUploadUrl({ 
          fileName: 'cover_' + selectedCoverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'), 
          contentType: selectedCoverFile.type || 'image/jpeg'
        });
        const coverUploadRes = await fetch(coverReq.uploadUrl, {
          method: 'PUT',
          body: selectedCoverFile,
          headers: { 'Content-Type': selectedCoverFile.type || 'image/jpeg' },
        });
        if (!coverUploadRes.ok) throw new Error('Không thể tải ảnh bìa lên máy chủ (AWS S3)');
        coverKey = coverReq.key;
      }
      setUploadProgress(80);

      // 4. Save to DB
      const newRes = await resourceApi.create({ ...createForm, fileKey: key, coverImageKey: coverKey });
      setResources([newRes, ...resources]);
      setIsModalOpen(false);
      setCreateForm({ title: '', description: '', tier: 'FREE', status: 'PUBLISHED' });
      setSelectedFile(null);
      setSelectedCoverFile(null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi tạo tài liệu');
    } finally {
      setCreating(false);
      setUploadProgress(0);
    }
  };

  const handleEditSubmit = async () => {
    if (!editForm || !editForm.title) {
      window.alert('Vui lòng nhập tên tài liệu');
      return;
    }
    try {
      setCreating(true);
      setUploadProgress(10);
      
      const updateData: any = {
        title: editForm.title,
        description: editForm.description,
        tier: editForm.tier,
        status: editForm.status
      };

      if (editFile) {
        setUploadProgress(30);
        const { uploadUrl, key } = await resourceApi.requestUploadUrl({ 
          fileName: editFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'), 
          contentType: editFile.type || 'application/octet-stream'
        });
        const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: editFile, headers: { 'Content-Type': editFile.type || 'application/octet-stream' }});
        if (!uploadRes.ok) throw new Error('Không thể tải tài liệu lên máy chủ');
        updateData.fileKey = key;
      }

      if (editCoverFile) {
        setUploadProgress(60);
        const { uploadUrl, key } = await resourceApi.requestUploadUrl({ 
          fileName: 'cover_' + editCoverFile.name.replace(/[^a-zA-Z0-9.-]/g, '_'), 
          contentType: editCoverFile.type || 'image/jpeg'
        });
        const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: editCoverFile, headers: { 'Content-Type': editCoverFile.type || 'image/jpeg' }});
        if (!uploadRes.ok) throw new Error('Không thể tải ảnh bìa lên máy chủ');
        updateData.coverImageKey = key;
      }
      
      setUploadProgress(80);
      const updatedRes = await resourceApi.update(editForm.id, updateData);
      setResources(resources.map(r => r.id === updatedRes.id ? { ...updatedRes, coverImageUrl: updatedRes.coverImageUrl || r.coverImageUrl } : r));
      setIsEditModalOpen(false);
      setEditForm(null);
      setEditFile(null);
      setEditCoverFile(null);
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi cập nhật tài liệu');
    } finally {
      setCreating(false);
      setUploadProgress(0);
    }
  };

  const handleViewResource = async (resource: Resource) => {
    try {
      const { downloadUrl } = await resourceApi.getDownloadUrl(resource.id);
      setViewerState({
        open: true,
        url: downloadUrl,
        title: resource.title,
        fileKey: resource.fileKey,
        tier: resource.tier as 'FREE' | 'VIP',
      });
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Bạn không có quyền xem tài liệu này.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirm({ title: 'Xóa tài liệu', message: 'Bạn có chắc chắn muốn xóa tài liệu này? Hành động này không thể hoàn tác.', variant: 'danger' }))) return;
    try {
      await resourceApi.delete(id);
      setResources(resources.filter(r => r.id !== id));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi xóa tài liệu');
    }
  };

  const handleEditStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const updated = await resourceApi.update(id, { status: newStatus as 'PUBLISHED' | 'DRAFT' });
      setResources(resources.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      window.alert(e instanceof Error ? e.message : 'Lỗi cập nhật trạng thái');
    }
  };

  const getFileIcon = (res: Resource) => {
    if (res.coverImageUrl) {
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={res.coverImageUrl} alt={res.title} className="w-full h-full object-cover" />;
    }
    const name = (res.title + res.fileKey).toLowerCase();
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
          Tài Liệu
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          Quản lý tài liệu học tập.
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
                <div key={res.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 transition-colors hover:border-gray-300">
                  <div 
                    className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1"
                    onClick={() => handleViewResource(res)}
                  >
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                      {getFileIcon(res)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-gray-800 truncate hover:text-[#78993a] transition-colors">{res.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {res.description || 'Tài liệu miễn phí'} • 
                        <span className={res.status === 'PUBLISHED' ? 'text-green-500 ml-1' : 'text-amber-500 ml-1'}>
                          {res.status === 'PUBLISHED' ? 'Công khai' : 'Nháp'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === res.id ? null : res.id); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {activeMenuId === res.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditForm({ id: res.id, title: res.title, description: res.description || '', tier: res.tier as 'FREE'|'VIP', status: res.status as 'DRAFT'|'PUBLISHED' });
                            setIsEditModalOpen(true);
                            setActiveMenuId(null); 
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditStatus(res.id, res.status); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {res.status === 'PUBLISHED' ? 'Chuyển về Nháp' : 'Đăng Công khai'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(res.id); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Xóa tài liệu
                        </button>
                      </div>
                    )}
                  </div>
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
                <div key={res.id} className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm border border-gray-100 transition-colors hover:border-gray-300">
                  <div 
                    className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1"
                    onClick={() => handleViewResource(res)}
                  >
                    <div className="h-10 w-10 shrink-0 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden">
                      {getFileIcon(res)}
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-bold text-gray-800 truncate hover:text-[#78993a] transition-colors">{res.title}</p>
                      <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                        {res.description || 'Tài liệu độc quyền'} • 
                        <span className={res.status === 'PUBLISHED' ? 'text-green-500 ml-1' : 'text-amber-500 ml-1'}>
                          {res.status === 'PUBLISHED' ? 'Công khai' : 'Nháp'}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="relative shrink-0">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === res.id ? null : res.id); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                    {activeMenuId === res.id && (
                      <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setEditForm({ id: res.id, title: res.title, description: res.description || '', tier: res.tier as 'FREE'|'VIP', status: res.status as 'DRAFT'|'PUBLISHED' });
                            setIsEditModalOpen(true);
                            setActiveMenuId(null); 
                          }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Chỉnh sửa
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditStatus(res.id, res.status); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {res.status === 'PUBLISHED' ? 'Chuyển về Nháp' : 'Đăng Công khai'}
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(res.id); setActiveMenuId(null); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Xóa tài liệu
                        </button>
                      </div>
                    )}
                  </div>
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
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? `Đang tải lên... ${uploadProgress}%` : 'Đăng tài liệu'}
              </Button>
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
            <Field label="Tệp tài liệu (PDF, PPT, Word, Ảnh) (*)">
              <div className="relative">
                <input
                  type="file"
                  onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                  disabled={creating}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#11321e] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#1f4e31]"
                />
              </div>
            </Field>
            <Field label="Ảnh bìa (Tùy chọn)">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setSelectedCoverFile(e.target.files?.[0] || null)}
                  disabled={creating}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-300"
                />
              </div>
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

      {/* Admin Edit Modal */}
      {user?.role === 'ADMIN' && editForm && (
        <Modal 
          open={isEditModalOpen} 
          onClose={() => !creating && setIsEditModalOpen(false)} 
          title="Chỉnh sửa tài liệu"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={creating}>Hủy</Button>
              <Button onClick={handleEditSubmit} disabled={creating}>
                {creating ? `Đang lưu... ${uploadProgress}%` : 'Lưu thay đổi'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <Field label="Tên tài liệu (*)">
              <Input value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} disabled={creating} />
            </Field>
            <Field label="Mô tả">
              <Textarea value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} disabled={creating} />
            </Field>
            <Field label="Tải lại tài liệu (Bỏ trống nếu không đổi)">
              <div className="relative">
                <input
                  type="file"
                  onChange={e => setEditFile(e.target.files?.[0] || null)}
                  disabled={creating}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-[#11321e] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-[#1f4e31]"
                />
              </div>
            </Field>
            <Field label="Đổi Ảnh bìa (Bỏ trống nếu không đổi)">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setEditCoverFile(e.target.files?.[0] || null)}
                  disabled={creating}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-gray-200 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-300"
                />
              </div>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Loại tài liệu">
                <Select value={editForm.tier} onChange={e => setEditForm({...editForm, tier: e.target.value as 'FREE'|'VIP'})} disabled={creating}>
                  <option value="FREE">Miễn phí</option>
                  <option value="VIP">VIP</option>
                </Select>
              </Field>
              <Field label="Trạng thái">
                <Select value={editForm.status} onChange={e => setEditForm({...editForm, status: e.target.value as 'DRAFT'|'PUBLISHED'})} disabled={creating}>
                  <option value="PUBLISHED">Công khai (Published)</option>
                  <option value="DRAFT">Nháp (Draft)</option>
                </Select>
              </Field>
            </div>
          </div>
        </Modal>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        open={viewerState.open}
        onClose={() => setViewerState({ ...viewerState, open: false })}
        title={viewerState.title}
        url={viewerState.url}
        fileKey={viewerState.fileKey}
        tier={viewerState.tier}
      />

    </div>
    </AuthGuard>
  );
}

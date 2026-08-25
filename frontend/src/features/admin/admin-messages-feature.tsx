'use client';

import { useState, useEffect } from 'react';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { Button } from '@/features/ui/components/button';
import { Search, Eye, X, Check, Clock, Reply, CheckCircle2, MessageSquare } from 'lucide-react';

export function AdminMessagesFeature() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL'); // ALL, NEW, CONTACTED, CLOSED
  const [search, setSearch] = useState('');
  
  const [selectedContact, setSelectedContact] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const data = await resourceApi.listContacts({ 
        status: filter === 'ALL' ? undefined : filter,
        limit: 50 
      });
      setContacts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [filter]);

  const handleReply = async () => {
    if (!replyText.trim() || !selectedContact) return;
    setReplying(true);
    try {
      await resourceApi.replyContact(selectedContact.id, replyText);
      setReplyText('');
      setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      console.error(err);
    } finally {
      setReplying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'NEW') return <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"><span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> NEW</span>;
    if (status === 'CONTACTED') return <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">CONTACTED</span>;
    return <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"><Check className="w-3 h-3" /> CLOSED</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a472a]">Quản lý Liên hệ</h1>
          <p className="text-sm text-gray-500">Review and respond to messages from the forest community.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm kiếm học viên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-2 bg-[#eaf4eb] border border-[#d5e8d7] rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#2e5e3d]/30 w-full md:w-64 text-[#1a472a] placeholder-[#2e5e3d]/60"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 pb-2 overflow-x-auto">
        {['ALL', 'NEW', 'CONTACTED', 'CLOSED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap border ${
              filter === tab ? 'bg-[#1a472a] text-white border-[#1a472a]' : 'bg-transparent border-[#2e5e3d]/30 text-[#1a472a] hover:bg-[#eaf4eb]'
            }`}
          >
            {tab === 'ALL' ? 'Tất cả (All)' : tab === 'NEW' ? 'Mới (NEW)' : tab === 'CONTACTED' ? 'Đang xử lý (CONTACTED)' : 'Đã giải quyết (CLOSED)'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 text-xs uppercase text-gray-500 font-medium">
              <tr>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Ngày gửi</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Đang tải...</td></tr>
              ) : contacts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Không có liên hệ nào</td></tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eaf4eb] text-[#1a472a] flex items-center justify-center font-bold text-xs uppercase">
                          {contact.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-500">{contact.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{contact.phone || '-'}</td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(contact.createdAt)}</td>
                    <td className="px-6 py-4">{getStatusBadge(contact.status)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedContact(contact)}
                        className="p-2 text-gray-400 hover:text-[#1a472a] transition-colors rounded-full hover:bg-[#eaf4eb]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>Hiển thị 1-{contacts.length} liên hệ</span>
          <div className="flex gap-1">
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">&lt;</button>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50">&gt;</button>
          </div>
        </div>
      </div>

      {/* Modal View / Reply */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#f3f4e8]">
              <h3 className="font-bold text-[#1a472a] text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> 
                Chi tiết liên hệ
              </h3>
              <button onClick={() => setSelectedContact(null)} className="p-2 hover:bg-white rounded-full text-gray-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <div className="flex items-start justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-500 w-20 inline-block">Họ tên:</span> <strong className="text-gray-900">{selectedContact.name}</strong></p>
                  <p><span className="text-gray-500 w-20 inline-block">Email:</span> <a href={`mailto:${selectedContact.email}`} className="text-[#1a472a] hover:underline">{selectedContact.email}</a></p>
                  <p><span className="text-gray-500 w-20 inline-block">SĐT:</span> {selectedContact.phone || 'Không có'}</p>
                </div>
                {getStatusBadge(selectedContact.status)}
              </div>
              
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Nội dung gửi lúc {formatDateTime(selectedContact.createdAt)}
                </p>
                <div className="bg-[#eaf4eb] p-4 rounded-2xl text-[#1a472a] text-sm whitespace-pre-wrap leading-relaxed border border-[#2e5e3d]/10">
                  {selectedContact.message}
                </div>
              </div>

              {selectedContact.status !== 'CLOSED' ? (
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Reply className="w-4 h-4 text-[#1a472a]" />
                    Soạn câu trả lời (Gửi trực tiếp vào Email học viên)
                  </p>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Chào bạn, mình là Admin..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#1a472a]/30 focus:outline-none resize-none"
                  />
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setSelectedContact(null)} className="rounded-full px-6 text-[#1a472a] border-[#1a472a]/30">Hủy</Button>
                    <Button 
                      onClick={handleReply} 
                      disabled={!replyText.trim() || replying}
                      loading={replying}
                      className="rounded-full px-8 bg-[#163f22] hover:bg-[#0f2e18] text-white"
                    >
                      Gửi phản hồi
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#eaf4eb] p-4 rounded-2xl text-center border border-[#d5e8d7]">
                  <p className="text-sm text-[#1a472a] font-medium flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Liên hệ này đã được xử lý và trả lời.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

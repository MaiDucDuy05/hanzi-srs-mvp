'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { Input } from '@/features/ui/components/form';
import { Badge } from '@/features/ui/components/badge';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { Download, FileText, Search } from 'lucide-react';
import { DocumentViewerModal } from '@/features/ui/components/document-viewer-modal';
import type { Resource } from '@/lib/api/types';

export function StudentResourcesFeature() {
  const t = useTranslations('Resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<{ id: string, title: string, tier: any, fileKey: string } | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const loadResources = async () => {
    try {
      setLoading(true);
      // Fetch only published resources (admin manages status)
      const res = await resourceApi.list({ status: 'PUBLISHED', limit: 100 });
      
      // MOCK DATA: Add 8 mock books to test UI as requested
      const mockBooks: Resource[] = Array.from({ length: 8 }).map((_, i) => ({
        id: `mock-book-${i}`,
        title: t('mockBookTitle', { number: i + 1 }),
        description: t('defaultDesc'),
        tier: i >= 4 ? 'PREMIUM' : 'FREE',
        status: 'PUBLISHED',
        fileKey: '',
        fileSize: 0,
        coverImageUrl: null, // Will fall back to default icon, or we can use a placeholder URL if needed
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as unknown as Resource));
      
      setResources([...res, ...mockBooks]);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleOpenDoc = async (resource: Resource) => {
    try {
      setDownloading(resource.id);
      const res = await resourceApi.getDownloadUrl(resource.id);
      if (res.downloadUrl) {
        setViewerUrl(res.downloadUrl);
        setViewerDoc({ id: resource.id, title: resource.title, tier: resource.tier, fileKey: resource.fileKey });
      } else {
        alert(t('downloadError'));
      }
    } catch (error: any) {
      console.error('Failed to get download URL:', error);
      alert(error?.message || t('loadError'));
    } finally {
      setDownloading(null);
    }
  };

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-4xl font-black text-[#215b3b] mb-6">{t('title')}</h1>
          <p className="text-[#1f4e31]/80 mt-1 text-sm font-medium">{t('subtitle')}</p>
        </div>
        <div className="relative w-full sm:w-[340px] mt-2 sm:mt-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            className="pl-11 bg-white border-none focus-visible:ring-emerald-500 rounded-full h-12 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] text-base"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-emerald-50/50 border border-emerald-100" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <FileText className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-emerald-800">{t('notFound')}</h3>
          <p className="text-emerald-600">{t('notFoundDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <div 
              key={resource.id} 
              className={`flex flex-row bg-white rounded-[28px] border-none p-[18px] hover:shadow-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 cursor-pointer hover:-translate-y-1 ${downloading === resource.id ? 'opacity-70 pointer-events-none' : ''}`}
              onClick={() => handleOpenDoc(resource)}
            >
              {/* Left: Cover Image */}
              <div className="w-[84px] h-[116px] shrink-0 bg-emerald-50 rounded-2xl overflow-hidden relative mr-4 flex items-center justify-center border border-emerald-50/50">
                {resource.coverImageUrl ? (
                  <img src={resource.coverImageUrl} alt={resource.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-emerald-400 bg-emerald-100/30">
                    <FileText className="h-10 w-10 opacity-50" />
                  </div>
                )}
              </div>
              
              {/* Right: Content */}
              <div className="flex-1 min-w-0 flex flex-col py-1">
                 <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h3 className="text-[17px] font-bold text-[#11321e] line-clamp-2 leading-[1.3] pr-2 tracking-tight" title={resource.title}>
                       {resource.title}
                    </h3>
                    { resource.tier === 'VIP' ? (
                      <Badge tone="amber" className="shrink-0 uppercase text-[10px] px-2.5 py-0.5 rounded-full font-bold tracking-wider shadow-sm">PREMIUM</Badge>
                    ) : (
                      <Badge tone="green" className="shrink-0 uppercase text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#43b97f] text-white tracking-wider shadow-sm border-none">FREE</Badge>
                    )}
                 </div>
                 <p className="text-[14px] text-gray-500 line-clamp-3 leading-relaxed mt-1">
                    {resource.description || t('defaultDesc')}
                 </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewerUrl && viewerDoc && (
        <DocumentViewerModal
          open={!!viewerUrl}
          onClose={() => {
            setViewerUrl(null);
            setViewerDoc(null);
          }}
          title={viewerDoc.title}
          url={viewerUrl}
          fileKey={viewerDoc.fileKey}
          tier={viewerDoc.tier}
        />
      )}
    </div>
  );
}

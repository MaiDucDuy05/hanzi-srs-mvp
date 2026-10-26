'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/features/ui/components/form';
import { resourceApi } from '@/lib/api/endpoints/resource';
import { FileText, Search } from 'lucide-react';
import { DocumentViewerModal } from '@/features/ui/components/document-viewer-modal';
import { StudentResourceCard } from './components/student-resource-card';
import { StudentResourceTypesBar } from './components/student-resource-types-bar';
import type { Resource, ResourceType } from '@/lib/api/types';

export function StudentResourcesFeature() {
  const t = useTranslations('Resources');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [viewerDoc, setViewerDoc] = useState<{ id: string, title: string, tier: any, fileKey: string } | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const types = await resourceApi.listTypes(false).catch(() => []);
        if (cancelled) return;
        setResourceTypes(types || []);
        if (types && types.length > 0) {
          setSelectedTypeId(types[0].id);
        }
      } catch (error) {
        console.error('Failed to load types:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedTypeId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const res = await resourceApi.listPaginated({ status: 'PUBLISHED', resourceTypeId: selectedTypeId, page, limit: 100 });
        if (cancelled) return;
        setResources(res.data || []);
        setTotalPages(res.meta?.totalPages || 1);
      } catch (error) {
        console.error('Failed to load resources:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedTypeId, page]);

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

  const filteredResources = resources.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()));
    return matchesSearch;
  });

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

      {/* Category Filter Pills */}
      <StudentResourceTypesBar
        resourceTypes={resourceTypes}
        selectedTypeId={selectedTypeId}
        onSelect={(typeId) => {
          setSelectedTypeId(typeId);
          setPage(1);
        }}
      />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-[170px] rounded-[28px] bg-white/70 border border-emerald-100/60 p-4 sm:p-5 flex items-stretch gap-4 sm:gap-5"
            >
              <div className="w-[96px] sm:w-[108px] h-full rounded-2xl bg-emerald-100/50 shrink-0" />
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="h-4 w-28 bg-emerald-100/60 rounded-full" />
                    <div className="h-4 w-12 bg-emerald-100/60 rounded-full" />
                  </div>
                  <div className="h-5 w-4/5 bg-gray-200/70 rounded-md mb-2" />
                  <div className="h-4 w-full bg-gray-100/70 rounded-md" />
                </div>
                <div className="pt-2 border-t border-emerald-50/70 flex justify-between">
                  <div className="h-3 w-20 bg-gray-100 rounded" />
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="text-center py-20 bg-emerald-50/30 rounded-xl border border-emerald-100">
          <FileText className="h-12 w-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-emerald-800">{t('notFound')}</h3>
          <p className="text-emerald-600">{t('notFoundDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredResources.map((resource) => (
            <StudentResourceCard
              key={resource.id}
              resource={resource}
              onClick={() => handleOpenDoc(resource)}
              isDownloading={downloading === resource.id}
              defaultDescription={t('defaultDesc')}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Trước
          </button>
          <span className="text-sm font-medium">Trang {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded-lg text-sm disabled:opacity-50"
          >
            Sau
          </button>
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

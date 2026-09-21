import React from 'react';
import { YctLevelDetailView } from '@/features/yct/yct-level-detail-view';

export const metadata = {
  title: 'Chi Tiết Cấp Độ YCT | Khoá Học Tiếng Trung Trẻ Em',
};

export default async function YctLevelPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <YctLevelDetailView code={code} />;
}

import React from 'react';
import { YctLevelsView } from '@/features/yct/yct-levels-view';

export const metadata = {
  title: 'Khoá Học YCT Thiếu Nhi | Tiếng Trung Trẻ Em',
  description: 'Học tiếng Trung chuẩn YCT cấp 1 đến 6 qua hình ảnh trực quan và mini-game vui nhộn dành riêng cho các bé.',
};

export default function YctPage() {
  return <YctLevelsView />;
}

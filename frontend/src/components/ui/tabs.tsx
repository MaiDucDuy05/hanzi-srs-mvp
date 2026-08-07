'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  key: string;
  label: string;
  badge?: number;
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}) {
  const [internal, setInternal] = useState(active);
  const current = active ?? internal;

  return (
    <div className="flex gap-1 border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => {
        const isActive = tab.key === current;
        return (
          <button
            key={tab.key}
            onClick={() => {
              setInternal(tab.key);
              onChange(tab.key);
            }}
            className={cn(
              '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand text-brand'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200',
            )}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="rounded-full bg-gray-100 px-1.5 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

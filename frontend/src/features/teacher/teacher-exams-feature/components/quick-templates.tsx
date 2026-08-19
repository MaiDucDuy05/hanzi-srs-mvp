'use client';

import { Timer, FileText, Award, Sparkles } from 'lucide-react';
import { ExamTemplate } from '../types';

const ICON_MAP = {
  TIMER: Timer,
  FILE_TEXT: FileText,
  AWARD: Award,
};

interface QuickTemplatesProps {
  templates: ExamTemplate[];
  onTemplateClick?: (templateId: string) => void;
}

export function QuickTemplates({ templates, onTemplateClick }: QuickTemplatesProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-[#1f5333]">
          <Sparkles className="h-5 w-5 text-[#78993a]" />
          <h2 className="font-bold text-[18px]">Quick Templates</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {templates.map((template) => {
          const Icon = ICON_MAP[template.icon];

          return (
            <button
              key={template.id}
              onClick={() => onTemplateClick?.(template.id)}
              className="relative overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-left hover:border-[var(--hover-border)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300 group"
              style={{ '--hover-border': template.hoverBorderColor } as React.CSSProperties}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-bl-full pointer-events-none"
                style={{ background: `from-[${template.bgColor}]` }}
              />

              <div
                className="h-12 w-12 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[var(--hover-border)] group-hover:text-[#1f5333] transition-colors shadow-sm"
                style={{ backgroundColor: template.bgColor, color: template.accentColor }}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-[#1f5333] text-lg mb-2 group-hover:text-[var(--hover-color)] transition-colors" style={{ '--hover-color': template.accentColor } as React.CSSProperties}>
                {template.title}
              </h3>
              <p className="text-[13px] text-gray-500 font-medium leading-relaxed">
                {template.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

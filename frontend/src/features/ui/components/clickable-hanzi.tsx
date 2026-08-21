'use client';

import React from 'react';
import { speakText } from '@/lib/utils/tts';
import { cn } from '@/lib/utils/cn';

interface ClickableHanziProps {
  text: string;
  className?: string;
  charClassName?: string;
}

export function ClickableHanzi({ text, className, charClassName }: ClickableHanziProps) {
  // Regex to match Chinese characters
  const isChineseChar = (char: string) => /[\u4e00-\u9fa5]/.test(char);

  return (
    <span className={className}>
      {text.split('').map((char, index) => {
        if (isChineseChar(char)) {
          return (
            <span
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                speakText(char);
              }}
              className={cn(
                'cursor-pointer hover:text-brand hover:scale-110 inline-block transition-transform',
                charClassName
              )}
              title="Nhấn để nghe"
            >
              {char}
            </span>
          );
        }
        return <span key={index}>{char}</span>;
      })}
    </span>
  );
}

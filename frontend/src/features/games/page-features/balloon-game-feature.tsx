'use client';

import React from 'react';
import { BalloonMode } from '@/features/games/components/balloon-mode';
import type { QuestionItem } from '@/features/practice/components/practice-models';

const MOCK_ITEMS: QuestionItem[] = [
  { id: '1', hanzi: '水', pinyin: 'shuǐ', meaning: 'water', audioKey: '' },
  { id: '2', hanzi: '火', pinyin: 'huǒ', meaning: 'fire', audioKey: '' },
  { id: '3', hanzi: '木', pinyin: 'mù', meaning: 'wood', audioKey: '' },
  { id: '4', hanzi: '金', pinyin: 'jīn', meaning: 'gold', audioKey: '' },
  { id: '5', hanzi: '土', pinyin: 'tǔ', meaning: 'earth', audioKey: '' },
  { id: '6', hanzi: '日', pinyin: 'rì', meaning: 'sun', audioKey: '' },
  { id: '7', hanzi: '月', pinyin: 'yuè', meaning: 'moon', audioKey: '' },
  { id: '8', hanzi: '你好', pinyin: 'nǐ hǎo', meaning: 'hello', audioKey: '' },
  { id: '9', hanzi: '学生', pinyin: 'xué shēng', meaning: 'student', audioKey: '' },
  { id: '10', hanzi: '老师', pinyin: 'lǎo shī', meaning: 'teacher', audioKey: '' },
  { id: '11', hanzi: '中国', pinyin: 'zhōng guó', meaning: 'China', audioKey: '' },
  { id: '12', hanzi: '美国', pinyin: 'měi guó', meaning: 'USA', audioKey: '' },
  { id: '13', hanzi: '喜欢', pinyin: 'xǐ huān', meaning: 'like', audioKey: '' },
  { id: '14', hanzi: '学习', pinyin: 'xué xí', meaning: 'study', audioKey: '' },
  { id: '15', hanzi: '朋友', pinyin: 'péng yǒu', meaning: 'friend', audioKey: '' },
  { id: '16', hanzi: '女人', pinyin: 'nǚ rén', meaning: 'woman', audioKey: '' },
];
 
export function BalloonGameFeature() {
  return (
    <div className="flex-1 flex flex-col w-full h-[calc(100vh-80px)] min-h-[600px] relative z-10">
      <BalloonMode
        items={MOCK_ITEMS}
        onComplete={(res) => {
          console.log('Game complete!', res);
        }}
      />
    </div>
  );
}

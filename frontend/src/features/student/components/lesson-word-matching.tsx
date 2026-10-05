'use client';

import { useState } from 'react';
import { ArrowLeft, Check, RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Vocabulary } from '@/lib/api/types';
import { shuffle } from '@/features/practice/components/practice-models';

const MAX_WORDS_PER_SET = 6;

interface LessonWordMatchingProps {
  vocabularies: Vocabulary[];
  onExit: () => void;
}

function pickSet(vocabularies: Vocabulary[], usedIds: string[]) {
  const unused = shuffle(vocabularies.filter((word) => !usedIds.includes(word.id)));
  const selected = unused.slice(0, MAX_WORDS_PER_SET);

  if (selected.length < Math.min(MAX_WORDS_PER_SET, vocabularies.length)) {
    const selectedIds = new Set(selected.map((word) => word.id));
    selected.push(
      ...shuffle(vocabularies.filter((word) => !selectedIds.has(word.id))).slice(
        0,
        Math.min(MAX_WORDS_PER_SET, vocabularies.length) - selected.length,
      ),
    );
  }

  return selected;
}

export function LessonWordMatching({ vocabularies, onExit }: LessonWordMatchingProps) {
  const t = useTranslations('Study.matching');
  const words = vocabularies.filter(
    (word) => word.hanzi.trim() && word.meaningVi.trim(),
  );
  const [setWords, setSetWords] = useState(() => pickSet(words, []));
  const [meaningOrder, setMeaningOrder] = useState(() => shuffle(setWords));
  const [usedIds, setUsedIds] = useState<string[]>(setWords.map((word) => word.id));
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [selectedHanzi, setSelectedHanzi] = useState<string | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<string | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [runComplete, setRunComplete] = useState(false);

  const resetSet = (nextWords: Vocabulary[]) => {
    setSetWords(nextWords);
    setMeaningOrder(shuffle(nextWords));
    setMatchedIds([]);
    setSelectedHanzi(null);
    setSelectedMeaning(null);
    setWrongIds([]);
  };

  const loadNextSet = () => {
    if (wrongIds.length > 0) return;
    const unseenWords = words.filter((word) => !usedIds.includes(word.id));
    const idsToAvoid = unseenWords.length > 0 ? usedIds : [];
    const nextWords = pickSet(words, idsToAvoid);
    setUsedIds([...new Set([...idsToAvoid, ...nextWords.map((word) => word.id)])]);
    setRunComplete(false);
    resetSet(nextWords);
  };

  const selectPair = (side: 'hanzi' | 'meaning', id: string) => {
    if (runComplete || wrongIds.length > 0 || matchedIds.includes(id)) return;

    const nextHanzi = side === 'hanzi' ? id : selectedHanzi;
    const nextMeaning = side === 'meaning' ? id : selectedMeaning;
    setSelectedHanzi(nextHanzi);
    setSelectedMeaning(nextMeaning);

    if (!nextHanzi || !nextMeaning) return;
    if (nextHanzi === nextMeaning) {
      const nextMatched = [...matchedIds, nextHanzi];
      setMatchedIds(nextMatched);
      setSelectedHanzi(null);
      setSelectedMeaning(null);
      if (nextMatched.length === setWords.length) setRunComplete(true);
      return;
    }

    setWrongIds([nextHanzi, nextMeaning]);
    window.setTimeout(() => {
      setWrongIds([]);
      setSelectedHanzi(null);
      setSelectedMeaning(null);
    }, 550);
  };

  if (words.length < 2) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-5 rounded-3xl bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-gray-700">{t('insufficientWords')}</p>
        <button onClick={onExit} className="rounded-full bg-[#1f5333] px-6 py-3 font-bold text-white">{t('backToLesson')}</button>
      </div>
    );
  }

  const buttonClass = (id: string, side: 'hanzi' | 'meaning') => {
    const matched = matchedIds.includes(id);
    const selected = side === 'hanzi' ? selectedHanzi === id : selectedMeaning === id;
    const wrong = wrongIds.includes(id);
    return `min-h-16 w-full rounded-2xl border-2 p-4 text-left transition-colors disabled:cursor-default ${
      matched ? 'border-emerald-300 bg-emerald-50 text-emerald-700' :
      wrong ? 'border-rose-300 bg-rose-50 text-rose-700' :
      selected ? 'border-[#8BC34A] bg-[#f3faec] text-[#215b3b]' :
      'border-gray-100 bg-white text-gray-800 hover:border-[#c8e6c9]'
    }`;
  };

  return (
    <main className="mx-auto flex min-h-[75vh] w-full max-w-4xl flex-col rounded-3xl bg-white p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button onClick={onExit} className="flex items-center gap-2 rounded-full px-3 py-2 font-semibold text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-4 w-4" /> {t('back')}
        </button>
        {!runComplete && (
          <button disabled={wrongIds.length > 0} onClick={loadNextSet} className="rounded-full bg-[#f3faec] px-4 py-2 text-sm font-bold text-[#215b3b] hover:bg-[#e7f4dc] disabled:opacity-50">
            {t('skipSet')}
          </button>
        )}
      </header>

      {runComplete ? (
        <section className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-8 w-8" /></div>
          <h1 className="text-2xl font-black text-[#215b3b]">{t('setComplete')}</h1>
          <p className="max-w-lg text-gray-500">{t('shuffleDescription')}</p>
          <button onClick={loadNextSet} className="flex items-center gap-2 rounded-full bg-[#1f5333] px-7 py-3 font-bold text-white hover:bg-[#163f25]">
            <RefreshCw className="h-4 w-4" /> {t('nextSet')}
          </button>
        </section>
      ) : (
        <>
          <div className="mb-5 flex items-center justify-between text-sm font-semibold text-gray-500">
            <span>{t('instruction')}</span>
            <span>{t('pairsCounter', { matched: matchedIds.length, total: setWords.length })}</span>
          </div>
          <div className="grid flex-1 grid-cols-1 content-start gap-3 sm:grid-cols-2 sm:gap-5">
            <div className="flex flex-col gap-3">
              {setWords.map((word) => (
                <button key={word.id} disabled={matchedIds.includes(word.id) || wrongIds.length > 0} onClick={() => selectPair('hanzi', word.id)} className={`${buttonClass(word.id, 'hanzi')} text-center text-2xl font-bold`}>
                  {word.hanzi}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {meaningOrder.map((word) => (
                <button key={word.id} disabled={matchedIds.includes(word.id) || wrongIds.length > 0} onClick={() => selectPair('meaning', word.id)} className={`${buttonClass(word.id, 'meaning')} text-center font-semibold`}>
                  {word.meaningVi}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  );
}

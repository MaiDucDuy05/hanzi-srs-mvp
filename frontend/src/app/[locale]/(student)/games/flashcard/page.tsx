'use client';

import { useState, useEffect } from 'react';
import { FlashcardGameFeature } from '@/features/games/page-features/flashcard-game-feature';
import { curriculumApi } from '@/lib/api/endpoints/curriculum';
import { useTranslations } from 'next-intl';

export default function FlashcardGame() {
  const t = useTranslations('Games');
  const [vocabularies, setVocabularies] = useState<
    { id: string; hanzi: string; pinyin: string; meaningVi: string; example: string | null; audioKey: string | null }[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    curriculumApi.listVocabularies({ limit: 100 })
      .then((data) => {
        setVocabularies(data.map((v) => ({
          id: v.id,
          hanzi: v.hanzi,
          pinyin: v.pinyin,
          meaningVi: v.meaningVi,
          example: v.example,
          audioKey: v.audioKey,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-400">{t('loadingVocab')}</p>
      </div>
    );
  }

  return <FlashcardGameFeature vocabularies={vocabularies} />;
}

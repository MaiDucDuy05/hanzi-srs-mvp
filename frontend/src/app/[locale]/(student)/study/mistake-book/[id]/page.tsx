import { getTranslations } from 'next-intl/server';
import { Button } from '@/features/ui/components/button';

type DetailKind = 'BANK' | 'BUY' | 'SELL' | 'LIBRARY';
type DetailType = 'VOCAB' | 'GRAMMAR';

const MOCK_DB: Record<string, { id: string; word: string; pinyin: string; kind: DetailKind; type: DetailType; wrongCount: number; lastWrong: string; noteKey: 'detailNoteBank' | 'detailNoteBuy' | 'detailNoteSell' | 'detailNoteLibrary' }> = {
  '1': { id: '1', word: '银行', pinyin: 'yínháng', kind: 'BANK', type: 'VOCAB', wrongCount: 3, lastWrong: '2023-10-01', noteKey: 'detailNoteBank' },
  '2': { id: '2', word: '买', pinyin: 'mǎi', kind: 'BUY', type: 'VOCAB', wrongCount: 5, lastWrong: '2023-10-05', noteKey: 'detailNoteBuy' },
  '3': { id: '3', word: '卖', pinyin: 'mài', kind: 'SELL', type: 'GRAMMAR', wrongCount: 2, lastWrong: '2023-10-05', noteKey: 'detailNoteSell' },
  '4': { id: '4', word: '图书馆', pinyin: 'túshūguǎn', kind: 'LIBRARY', type: 'VOCAB', wrongCount: 1, lastWrong: '2023-10-10', noteKey: 'detailNoteLibrary' },
};

function meaningKey(kind: DetailKind): 'meaningBank' | 'meaningBuy' | 'meaningSell' | 'meaningLibrary' {
  switch (kind) {
    case 'BANK': return 'meaningBank';
    case 'BUY': return 'meaningBuy';
    case 'SELL': return 'meaningSell';
    case 'LIBRARY': return 'meaningLibrary';
  }
}

function typeKey(type: DetailType): 'typeVocabulary' | 'typeGrammar' {
  return type === 'VOCAB' ? 'typeVocabulary' : 'typeGrammar';
}

export default async function MistakeDetail({ params }: { params: { id: string } }) {
  const detail = MOCK_DB[params.id];
  const t = await getTranslations('MistakeBook');

  if (!detail) {
    return (
      <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center">
        <h2 className="text-xl font-bold text-gray-800">{t('detailNotFound')}</h2>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col overflow-hidden">
      {/* Detail header */}
      <div className="p-8 border-b border-gray-100 bg-green-50/50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white text-green-700 text-sm font-bold rounded-full border border-green-200">
                {t(typeKey(detail.type))}
              </span>
              <span className="text-sm text-gray-500">{t('detailAddedOn', { date: detail.lastWrong })}</span>
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-2 font-heading">{detail.word}</h1>
            <p className="text-2xl text-gray-600 mb-1">{detail.pinyin}</p>
            <p className="text-xl text-gray-700 font-medium">{t(meaningKey(detail.kind))}</p>
          </div>
          <div className="text-right">
            <div className="inline-flex flex-col items-center justify-center bg-red-50 text-red-700 rounded-2xl p-4 min-w-[100px]">
              <span className="text-3xl font-black">{detail.wrongCount}</span>
              <span className="text-sm font-medium mt-1">{t('detailTimesWrong')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes & Review */}
      <div className="p-8 flex-1 flex flex-col">
        <div className="mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            {t('detailNotesHeading')}
          </h3>
          <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 text-gray-700 leading-relaxed">
            {t(detail.noteKey)}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100 flex gap-4">
          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
            {t('detailReviewNow')}
          </Button>
          <Button size="lg" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50">
            {t('detailMarkMastered')}
          </Button>
        </div>
      </div>
    </div>
  );
}

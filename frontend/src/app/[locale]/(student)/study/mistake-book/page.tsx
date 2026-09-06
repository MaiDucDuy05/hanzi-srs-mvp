import { getTranslations } from 'next-intl/server';

export default async function MistakeBookPage() {
  const t = await getTranslations('MistakeBook');

  return (
    <div className="flex h-full w-full items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">{t('emptyHeading')}</h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          {t('emptyDescription')}
        </p>
      </div>
    </div>
  );
}

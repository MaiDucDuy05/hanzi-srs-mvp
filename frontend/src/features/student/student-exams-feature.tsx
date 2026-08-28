'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { testAssignmentsApi, testApi } from '@/lib/api/endpoints';
import type { TestAssignment, TestAttempt } from '@/lib/api/types';
import { Card, CardBody } from '@/features/ui/components/card';
import { Button } from '@/features/ui/components/button';
import { PageLoading } from '@/features/ui/components/spinner';
import { ErrorState } from '@/features/ui/components/error-state';
import { formatDateTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { Clock, Calendar, Target, Search, Trophy, Hourglass, Target as TargetIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function StudentExamsFeature() {
  const router = useRouter();
  const t = useTranslations('Exams');
  const [assignments, setAssignments] = useState<TestAssignment[]>([]);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'COMPLETED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      testAssignmentsApi.getAssigned(),
      testApi.listAttempts(),
    ])
      .then(([assignRes, attemptRes]) => {
        setAssignments(assignRes);
        setAttempts(attemptRes || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (assignment: TestAssignment) => {
    if (!window.confirm(t('startConfirm', { name: assignment.test?.name || '' }))) return;
    try {
      const attempt = await testApi.startAttempt(assignment.testId, assignment.id);
      router.push(`/dashboard/exams/${attempt.id}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : t('startError'));
    }
  };

  const getAssignmentState = (assignment: TestAssignment) => {
    const testAttempts = attempts.filter((a) => a.testId === assignment.testId && a.assignmentId === assignment.id);
    const inProgress = testAttempts.find((a) => a.status === 'IN_PROGRESS');
    const submittedCount = testAttempts.filter((a) => a.status === 'SUBMITTED' || a.status === 'GRADED').length;
    const limit = assignment.test?.attemptLimit || 1;
    
    const now = new Date();
    const isStarted = new Date(assignment.startTime) <= now;
    const isEnded = new Date(assignment.endTime) < now;
    
    const hasSubmitted = testAttempts.some(t => t.status === 'SUBMITTED');
    const category = hasSubmitted ? 'SUBMITTED' : (submittedCount >= limit || isEnded ? 'COMPLETED' : 'PENDING');

    return { testAttempts, inProgress, submittedCount, limit, isStarted, isEnded, category };
  };

  // Deduplicate assignments by testId, keeping the latest one
  const uniqueAssignments = assignments.reduce((acc, current) => {
    const existingIndex = acc.findIndex(a => a.testId === current.testId);
    if (existingIndex === -1) {
      acc.push(current);
    } else {
      // If current is newer, replace the existing one
      const currentVal = (current as any).createdAt || current.startTime;
      const existingVal = (acc[existingIndex] as any).createdAt || acc[existingIndex].startTime;
      if (new Date(currentVal) > new Date(existingVal)) {
        acc[existingIndex] = current;
      }
    }
    return acc;
  }, [] as typeof assignments);

  const enrichedAssignments = uniqueAssignments.map(a => ({ ...a, state: getAssignmentState(a) }));
  
  const stats = {
    pending: enrichedAssignments.filter(a => a.state.category === 'PENDING').length,
    submitted: enrichedAssignments.filter(a => a.state.category === 'SUBMITTED').length,
    completed: enrichedAssignments.filter(a => a.state.category === 'COMPLETED').length,
  };

  const filteredAssignments = enrichedAssignments.filter(a => {
    const matchesFilter = filter === 'ALL' || a.state.category === filter;
    const matchesSearch = (a.test?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) return <PageLoading label={t('loading')} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Section */}
      <div className="bg-[#466a50] rounded-3xl p-8 relative overflow-hidden shadow-lg text-white">
        <div className="relative z-10 max-w-xl">
          <p className="text-brand-100 mb-2 font-medium tracking-wider text-sm uppercase">{t('subtitle')}</p>
          <h1 className="text-4xl font-extrabold mb-4 font-display">{t('title')}</h1>
        </div>
        
        {/* Placeholder for Panda Illustration */}
        <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:block opacity-80 mix-blend-luminosity">
          <div className="w-full h-full bg-gradient-to-l from-white/20 to-transparent" />
        </div>
      </div>


      {/* Controls: Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
        <div className="flex gap-2 bg-white p-1.5 rounded-full shadow-sm border border-gray-100 overflow-x-auto max-w-full">
          {(['ALL', 'PENDING', 'SUBMITTED', 'COMPLETED'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-300 whitespace-nowrap",
                filter === f 
                  ? "bg-[#466a50] text-white shadow-md transform scale-105" 
                  : "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              {f === 'ALL' ? t('filterAll', { count: enrichedAssignments.length }) :
               f === 'PENDING' ? t('filterPending', { count: stats.pending }) :
               f === 'SUBMITTED' ? t('filterSubmitted', { count: stats.submitted }) :
               t('filterCompleted', { count: stats.completed })}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Exam Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map(a => {
          const { inProgress, submittedCount, limit, isEnded, isStarted, testAttempts, category } = a.state;
          const hasReachedLimit = submittedCount >= limit;
          const bestAttempt = testAttempts.filter(t => t.status === 'GRADED').sort((a, b) => (b.score || 0) - (a.score || 0))[0];
          
          // Determine badge styling based on state
          let badgeText = 'Pending';
          let badgeClass = 'bg-brand-50 text-brand-700 border-brand-200';
          
          const hoursUntilEnd = (new Date(a.endTime).getTime() - new Date().getTime()) / (1000 * 60 * 60);
          if (category === 'COMPLETED') {
            badgeText = t('badgeCompleted');
            badgeClass = 'bg-gray-100 text-gray-700 border-gray-200';
          } else if (category === 'SUBMITTED') {
            badgeText = t('badgeSubmitted');
            badgeClass = 'bg-yellow-50 text-yellow-700 border-yellow-200';
          } else if (hoursUntilEnd > 0 && hoursUntilEnd < 24 && !hasReachedLimit) {
            badgeText = t('badgeExpiring');
            badgeClass = 'bg-red-50 text-red-600 border-red-200';
          } else if (!isStarted) {
            badgeText = t('badgeUpcoming');
            badgeClass = 'bg-blue-50 text-blue-600 border-blue-200';
          }

          return (
            <Card key={a.id} className={cn("group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100", !isStarted && "opacity-75")}>
              <CardBody className="p-6 flex flex-col h-full relative">
                
                {/* Header Row: Badge & Score */}
                <div className="flex justify-between items-start mb-4">
                  <div className={cn("px-3 py-1 text-xs font-semibold rounded-full border", badgeClass)}>
                    {badgeText}
                  </div>
                  {bestAttempt && (
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm border-2 border-green-200">
                      {bestAttempt.score}%
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow space-y-3 mb-6">
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-brand-700 transition-colors">{a.test?.name || t('unnamedExam')}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{a.test?.description || t('noDescription')}</p>
                </div>
                
                {/* Metadata */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="w-4 h-4 mr-2 opacity-70" />
                    <span>{a.test?.timeLimitMinutes} {t('minutes')}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-4 h-4 mr-2 opacity-70" />
                    <span>{t('due')} {formatDateTime(a.endTime)}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Target className="w-4 h-4 mr-2 opacity-70" />
                    <span>{submittedCount} / {limit} {t('attempts')}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4 border-t border-gray-100 mt-auto">
                  {!isStarted ? (
                    <Button className="w-full rounded-full font-medium" disabled variant="outline">{t('notOpenedYet')}</Button>
                  ) : inProgress ? (
                    <Button className="w-full rounded-full font-medium bg-amber-500 hover:bg-amber-600 text-white" onClick={() => router.push(`/dashboard/exams/${inProgress.id}`)}>
                      {t('continueExam')}
                    </Button>
                  ) : hasReachedLimit ? (
                    bestAttempt ? (
                      <Button className="w-full rounded-full font-medium" variant="outline" onClick={() => router.push(`/dashboard/exams/${bestAttempt.id}/result`)}>
                        {t('viewResults')}
                      </Button>
                    ) : (
                      <Button className="w-full rounded-full font-medium" disabled variant="outline">{t('btnSubmitted')}</Button>
                    )
                  ) : isEnded ? (
                    <Button className="w-full rounded-full font-medium" disabled variant="outline">{t('btnExpired')}</Button>
                  ) : (
                    <Button 
                      className={cn(
                        "w-full rounded-full font-semibold transition-all duration-300 shadow-md",
                        badgeText === 'Expiring Soon' ? "bg-red-600 hover:bg-red-700 text-white" : "bg-[#466a50] hover:bg-[#344f3b] text-white hover:shadow-lg"
                      )} 
                      onClick={() => handleStart(a)}
                    >
                      {t('startExam')}
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
        
        {filteredAssignments.length === 0 && (
          <div className="col-span-full py-16 flex flex-col items-center justify-center text-center bg-white rounded-3xl border-2 border-dashed border-gray-200 shadow-sm">
            <div className="w-24 h-24 mb-4 opacity-20 text-gray-400">
              <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm11 0c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">{t('noExams')}</h3>
            <p className="text-gray-500 max-w-sm">{t('noExamsDesc')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

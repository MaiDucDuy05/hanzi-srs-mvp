'use client';

import { useEffect, useState } from 'react';
import { 
  Lightbulb,
  ArrowRight,
  Users,
  Trophy,
  ClipboardList,
  FileText,
  Database
} from 'lucide-react';
import { resourceApi, testApi, questionBankApi, speakingApi } from '@/lib/api/endpoints';
import type { TestAttempt } from '@/lib/api/types';
import { PageLoading } from '@/features/ui/components/spinner';

export function TeacherDashboardFeature() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    exams: 0,
    questions: 0,
    pendingSpeaking: 0,
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [
          usersData,
          examsData,
          questionsData,
          speakingData,
          attemptsData
        ] = await Promise.all([
          resourceApi.listUsers({}),
          testApi.list(),
          questionBankApi.list(),
          speakingApi.list({ status: 'SUBMITTED' }),
          resourceApi.listStudentActivities({ limit: 10 })
        ]);

        if (cancelled) return;

        const studentsCount = Array.isArray(usersData) ? usersData.filter((u: any) => u.role !== 'ADMIN' && u.role !== 'TEACHER').length : 0;

        setStats({
          students: studentsCount,
          exams: Array.isArray(examsData) ? examsData.length : 0,
          questions: Array.isArray(questionsData) ? questionsData.length : (questionsData as any).meta?.total || 0,
          pendingSpeaking: Array.isArray(speakingData) ? speakingData.length : (speakingData as any).meta?.total || 0,
        });

        setRecentActivities(Array.isArray(attemptsData) ? attemptsData : []);

      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();

    return () => { cancelled = true; };
  }, []);

  if (loading) return <PageLoading label="Đang tải dữ liệu Dashboard..." />;

  return (
    <div className="max-w-[1200px] pb-20 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#eaf3c5] rounded-[40px] p-10 mb-10 flex items-center justify-between shadow-[0_8px_30px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-[36px] font-extrabold text-[#1f5333] tracking-tight mb-3">
            Good Morning, Teacher Panda.
          </h1>
          <p className="text-[15px] text-gray-500 font-medium">
            The forest is peaceful today. You have <span className="font-bold text-[#1f5333]">{stats.pendingSpeaking} pending tasks</span>.
          </p>
        </div>
        
        {/* Decorative Image Container */}
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-lg relative z-10 shrink-0">
          <img 
            src="https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
            alt="Panda resting in forest" 
            className="h-full w-full object-cover"
          />
        </div>

        {/* Background blobs */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#fcfce8] rounded-full blur-3xl opacity-60 pointer-events-none" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main Content) */}
        <div className="flex-1 space-y-10">
          
          {/* AI Insights */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#78993a]">
              <Lightbulb className="h-5 w-5" strokeWidth={2.5} />
              <h2 className="font-bold text-[16px]">System Insights</h2>
            </div>
            
            <div className="bg-white border-2 border-[#dde8a6] rounded-[24px] p-6 shadow-sm flex items-start gap-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="h-12 w-12 bg-[#fcfce8] rounded-full flex items-center justify-center text-[#78993a] shrink-0 border border-[#eaf3c5]">
                <Lightbulb className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-[17px] font-extrabold text-[#1f5333] mb-2">System Overview</h3>
                <p className="text-[14px] text-gray-600 font-medium leading-relaxed max-w-xl mb-4">
                  Currently you have <span className="font-bold text-[#1f5333]">{stats.students}</span> active students and <span className="font-bold text-[#1f5333]">{stats.exams}</span> exams in the system. Check the question bank to add more content.
                </p>
              </div>
            </div>
          </div>

          {/* Active Canopies -> My Class Overview */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#4a5a3a]">
              <Users className="h-5 w-5" strokeWidth={2.5} />
              <h2 className="font-bold text-[16px]">My Class Overview</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Stat Card 1 */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#f3f4e1] p-3 rounded-full text-[#1f5333]">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-extrabold text-3xl text-[#1f5333] mb-1">{stats.students}</h3>
                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide">Total Students</p>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#eaf3c5] p-3 rounded-full text-[#78993a]">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-extrabold text-3xl text-[#1f5333] mb-1">{stats.exams}</h3>
                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide">Exams Created</p>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-[#f0f2f5] p-3 rounded-full text-gray-600">
                    <Database className="h-6 w-6" />
                  </div>
                </div>
                <h3 className="font-extrabold text-3xl text-[#1f5333] mb-1">{stats.questions}</h3>
                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wide">Questions in Bank</p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column (Widgets) */}
        <div className="w-full lg:w-[350px] shrink-0 space-y-8">
          
          {/* Forest Activity */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-[#78993a]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h2 className="font-bold text-[16px]">Recent Activity</h2>
            </div>
            
            <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] max-h-[400px] overflow-y-auto">
              
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-100 before:to-transparent">
                
                {stats.pendingSpeaking > 0 && (
                  <div className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-4 border-white bg-[#f0f2f5] text-[#1f5333] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute -left-3 md:left-1/2">
                      <ClipboardList className="h-3 w-3" strokeWidth={3} />
                    </div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-even:pr-4 md:group-odd:pl-4">
                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                        <span className="font-bold text-[#1f5333]">{stats.pendingSpeaking} pending</span> HSKK audio submissions to review.
                      </p>
                    </div>
                  </div>
                )}

                {recentActivities.length > 0 ? recentActivities.map((activity, index) => {
                  let Icon = FileText;
                  let colorClass = "text-gray-500 bg-gray-100";
                  let message = "had a new activity";

                  if (activity.activityType === 'TEST_COMPLETED') {
                    Icon = Trophy;
                    colorClass = "text-[#78993a] bg-[#eaf3c5]";
                    message = "submitted a test";
                  } else if (activity.activityType === 'PRACTICE_COMPLETED') {
                    Icon = Lightbulb;
                    colorClass = "text-[#e55353] bg-[#fff4f4]";
                    message = "completed a practice session";
                  } else if (activity.activityType === 'REWARD_REDEEMED') {
                    Icon = Trophy;
                    colorClass = "text-yellow-600 bg-yellow-100";
                    message = "redeemed a reward";
                  }

                  return (
                    <div key={activity.id} className="relative flex items-start justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full border-4 border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 absolute -left-3 md:left-1/2 ${colorClass}`}>
                        <Icon className="h-3 w-3" strokeWidth={3} />
                      </div>
                      <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] pl-4 md:pl-0 md:group-even:pr-4 md:group-odd:pl-4">
                        <p className="text-[13px] text-gray-600 font-medium leading-relaxed">
                          <span className="font-bold text-[#1f5333]">{activity.user?.fullName || 'A student'}</span> {message}.
                        </p>
                        <time className="text-[11px] font-bold text-gray-400 mt-1 block">
                          {activity.expAwarded > 0 ? `+${activity.expAwarded} EXP - ` : ''}{new Date(activity.createdAt).toLocaleDateString()}
                        </time>
                      </div>
                    </div>
                  );
                }) : (
                   <p className="text-sm text-gray-500 italic pl-4">No recent activities found.</p>
                )}

              </div>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

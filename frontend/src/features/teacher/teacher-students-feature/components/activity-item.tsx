import type { StudentActivity } from '../types';
import { formatDate, formatActivityLabel } from '../utils';
import { 
  BookOpen, 
  Target, 
  Star, 
  Flame, 
  Trophy, 
  FileEdit, 
  Gift, 
  Rocket, 
  Pin 
} from 'lucide-react';

const ICON_COMPONENTS: Record<string, any> = {
  LESSON_COMPLETED: { icon: BookOpen, color: 'text-emerald-700 bg-emerald-50' },
  PRACTICE_COMPLETED: { icon: Target, color: 'text-blue-700 bg-blue-50' },
  PERFECT_BONUS: { icon: Star, color: 'text-amber-600 bg-amber-50' },
  COMBO_BONUS: { icon: Flame, color: 'text-orange-600 bg-orange-50' },
  STREAK_MILESTONE: { icon: Trophy, color: 'text-yellow-600 bg-yellow-50' },
  MISTAKE_REVIEWED: { icon: FileEdit, color: 'text-indigo-600 bg-indigo-50' },
  REDEEMED_REWARD: { icon: Gift, color: 'text-purple-600 bg-purple-50' },
  REWARD_GRANTED: { icon: Gift, color: 'text-purple-600 bg-purple-50' },
  LEVEL_UP: { icon: Rocket, color: 'text-rose-600 bg-rose-50' },
};

export function ActivityItem({ activity }: { activity: StudentActivity }) {
  const conf = ICON_COMPONENTS[activity.activityType] || { icon: Pin, color: 'text-gray-500 bg-gray-50' };
  const Icon = conf.icon;
  const label = formatActivityLabel(activity);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${conf.color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-gray-700">{label}</div>
        <div className="text-[11px] text-gray-400">{formatDate(activity.createdAt)}</div>
      </div>
      {activity.expAwarded > 0 && (
        <div className="text-[13px] font-bold text-[#78993a] shrink-0">+{activity.expAwarded} EXP</div>
      )}
    </div>
  );
}


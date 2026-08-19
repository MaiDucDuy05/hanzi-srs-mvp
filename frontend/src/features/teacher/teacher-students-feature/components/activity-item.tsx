import type { StudentActivity } from '../types';
import { formatDate, formatActivityLabel, ACTIVITY_ICONS } from '../utils';

export function ActivityItem({ activity }: { activity: StudentActivity }) {
  const icon = ACTIVITY_ICONS[activity.activityType] || '📌';
  const label = formatActivityLabel(activity.activityType);

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xl shrink-0">{icon}</span>
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

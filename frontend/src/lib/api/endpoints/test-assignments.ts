import { apiFetch, unwrap } from '../client';
import type { Single, TestAssignment } from '../types';

export const testAssignmentsApi = {
  getAssigned: () => unwrap(apiFetch<Single<TestAssignment[]>>('/test-assignments/assigned')),
  create: (data: { testId: string; classroomId?: string | null; studentIds?: string[]; startTime: string; endTime: string }) =>
    unwrap(apiFetch<Single<TestAssignment>>('/test-assignments', { method: 'POST', body: JSON.stringify(data) })),
};

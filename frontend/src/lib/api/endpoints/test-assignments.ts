import { apiFetch, unwrap } from '../client';
import type { Single, TestAssignment } from '../types';

export const testAssignmentsApi = {
  getAssigned: () => unwrap(apiFetch<Single<TestAssignment[]>>('/test-assignments/assigned')),
};

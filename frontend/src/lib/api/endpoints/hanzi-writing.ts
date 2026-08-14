/**
 * PR-13: Hanzi Writing Practice API endpoints.
 * Base path: /practice/hanzi-writing
 */
import { apiFetch, unwrap } from '../client';
import type { Single } from '../types';
import type {
  HanziWritingStartResult,
  HanziWritingCompleteResult,
  HanziCharResult,
  HanziChar,
} from '../types';

export const hanziWritingApi = {
  /**
   * POST /practice/hanzi-writing/preview
   * Xem trước danh sách chữ Hán (không tạo attempt).
   */
  preview: (params: {
    levelId?: string;
    lessonId?: string;
    topicId?: string;
  }) =>
    unwrap(
      apiFetch<Single<HanziChar[]>>('/practice/hanzi-writing/preview', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    ),

  /**
   * POST /practice/hanzi-writing/start
   * Tạo phiên luyện viết + trả danh sách chữ Hán.
   */
  start: (params: {
    levelId?: string;
    lessonId?: string;
    topicId?: string;
    chars?: string[];
  }) =>
    unwrap(
      apiFetch<Single<HanziWritingStartResult>>('/practice/hanzi-writing/start', {
        method: 'POST',
        body: JSON.stringify(params),
      }),
    ),

  /**
   * POST /practice/hanzi-writing/:attemptId/complete
   * Lưu kết quả cuối phiên.
   */
  complete: (
    attemptId: string,
    data: { characters: HanziCharResult[]; durationSeconds: number },
  ) =>
    unwrap(
      apiFetch<Single<HanziWritingCompleteResult>>(
        `/practice/hanzi-writing/${attemptId}/complete`,
        { method: 'POST', body: JSON.stringify(data) },
      ),
    ),
};

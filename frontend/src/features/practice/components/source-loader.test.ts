import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { loadSourceVocab } from './source-loader';

vi.mock('@/lib/api/endpoints', () => ({
  curriculumApi: {
    listVocabularies: vi.fn(),
    getLesson: vi.fn(),
    listTopicVocabularies: vi.fn(),
    getVocabulary: vi.fn(),
  },
}));

import { curriculumApi } from '@/lib/api/endpoints';

describe('loadSourceVocab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('LEVEL: gọi listVocabularies với levelId', async () => {
    const vocabs = [{ id: 'v1' }];
    (curriculumApi.listVocabularies as any).mockResolvedValue(vocabs);
    const result = await loadSourceVocab('LEVEL', 'lvl-1');
    expect(curriculumApi.listVocabularies).toHaveBeenCalledWith({
      levelId: 'lvl-1',
      status: 'PUBLISHED',
    });
    expect(result).toBe(vocabs);
  });

  it('LESSON: gọi getLesson → listVocabularies theo levelId', async () => {
    const lesson = { levelId: 'lvl-2' };
    const vocabs = [{ id: 'v1' }];
    (curriculumApi.getLesson as any).mockResolvedValue(lesson);
    (curriculumApi.listVocabularies as any).mockResolvedValue(vocabs);

    const result = await loadSourceVocab('LESSON', 'lesson-1');
    expect(curriculumApi.getLesson).toHaveBeenCalledWith('lesson-1');
    expect(curriculumApi.listVocabularies).toHaveBeenCalledWith({
      levelId: 'lvl-2',
      status: 'PUBLISHED',
    });
    expect(result).toBe(vocabs);
  });

  it('TOPIC: gọi listTopicVocabularies → getVocabulary từng id', async () => {
    const links = [{ vocabularyId: 'v1' }, { vocabularyId: 'v2' }];
    const v1 = { id: 'v1', status: 'PUBLISHED' };
    const v2 = { id: 'v2', status: 'DRAFT' };
    (curriculumApi.listTopicVocabularies as any).mockResolvedValue(links);
    (curriculumApi.getVocabulary as any)
      .mockResolvedValueOnce(v1)
      .mockResolvedValueOnce(v2);

    const result = await loadSourceVocab('TOPIC', 'topic-1');
    expect(curriculumApi.listTopicVocabularies).toHaveBeenCalledWith({
      topicId: 'topic-1',
    });
    // Filter chỉ lấy PUBLISHED
    expect(result).toEqual([v1]);
  });

  it('TOPIC: trả mảng rỗng khi không có links', async () => {
    (curriculumApi.listTopicVocabularies as any).mockResolvedValue([]);
    const result = await loadSourceVocab('TOPIC', 'topic-1');
    expect(result).toEqual([]);
  });
});

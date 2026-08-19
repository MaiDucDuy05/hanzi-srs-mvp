import { paginatedResult, findOrNotFound } from './query-helpers';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

describe('query-helpers', () => {
  describe('paginatedResult', () => {
    it('should return correct pagination metadata', () => {
      const data = [{ id: '1' }, { id: '2' }];
      const result = paginatedResult(data, 10, 1, 5);

      expect(result.data).toEqual(data);
      expect(result.meta.total).toBe(10);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.totalPages).toBe(2);
    });

    it('should calculate 0 totalPages when total is 0', () => {
      const result = paginatedResult([], 0, 1, 10);

      expect(result.meta.totalPages).toBe(0);
    });

    it('should handle page 2 with 5 items per page', () => {
      const data = [{ id: '6' }, { id: '7' }];
      const result = paginatedResult(data, 7, 2, 5);

      expect(result.meta.totalPages).toBe(2);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
    });

    it('should handle exact division (20 items, 5 per page = 4 pages)', () => {
      const result = paginatedResult([], 20, 1, 5);

      expect(result.meta.totalPages).toBe(4);
    });

    it('should handle single item', () => {
      const data = [{ id: '1' }];
      const result = paginatedResult(data, 1, 1, 20);

      expect(result.meta.totalPages).toBe(1);
    });
  });

  describe('findOrNotFound', () => {
    let mockRepo: jest.Mocked<Partial<Repository<any>>>;

    beforeEach(() => {
      mockRepo = {
        findOne: jest.fn(),
      };
    });

    it('should return entity when found', async () => {
      const entity = { id: 'test-id', name: 'Test' };
      (mockRepo.findOne as jest.Mock).mockResolvedValue(entity);

      const result = await findOrNotFound(mockRepo as Repository<any>, 'test-id', 'Test Entity');

      expect(result).toEqual(entity);
      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
    });

    it('should throw NotFoundException with custom label when entity not found', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);

      await expect(findOrNotFound(mockRepo as Repository<any>, 'non-existent', 'User')).rejects.toThrow(
        new NotFoundException('User not found'),
      );
    });

    it('should include label in error message', async () => {
      (mockRepo.findOne as jest.Mock).mockResolvedValue(null);

      try {
        await findOrNotFound(mockRepo as Repository<any>, 'abc', 'Custom Entity');
        fail('Should have thrown');
      } catch (error) {
        expect((error as NotFoundException).message).toBe('Custom Entity not found');
      }
    });
  });
});

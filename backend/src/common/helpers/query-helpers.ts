import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../pagination.dto';

/**
 * Build a standardized paginated result object.
 */
export function paginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Find entity by ID or throw NotFoundException with a readable label.
 */
export async function findOrNotFound<T extends { id: string }>(
  repo: Repository<T>,
  id: string,
  label: string,
): Promise<T> {
  const entity = await repo.findOne({ where: { id } as any });
  if (!entity) throw new NotFoundException(`${label} not found`);
  return entity;
}

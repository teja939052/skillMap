import type { PaginatedResult } from '../types/index.js';

export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export function parsePagination(query: {
  page?: string | number;
  limit?: string | number;
  sort?: string;
  order?: string;
}): PaginationParams {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const sort = query.sort ?? 'createdAt';
  const order = query.order === 'asc' ? 'asc' : 'desc';
  return { page, limit, sort, order };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function getSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}

import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function successResponse<T>(
  res: Response,
  data: T,
  options: {
    statusCode?: number;
    message?: string;
    meta?: PaginationMeta | Record<string, unknown>;
  } = {}
): Response {
  return res.status(options.statusCode ?? 200).json({
    success: true,
    ...(options.message ? { message: options.message } : {}),
    data,
    ...(options.meta ? { meta: options.meta } : {}),
  });
}

export function paginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

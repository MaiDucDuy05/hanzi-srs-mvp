export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
}

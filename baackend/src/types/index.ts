import { Request } from "express";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DatasetQuery {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

export interface DataQuery extends DatasetQuery {
  columns?: string;
  filters?: string;
  from?: string;
  to?: string;
}

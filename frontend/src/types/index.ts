export interface Dataset {
  id?: string;
  _id: string;
  userId?: string;
  name: string;
  originalFileName: string;
  fileType: "CSV" | "JSON" | "Parquet" | "XLSX";
  fileSize: number;
  rowCount: number;
  columnCount: number;
  columns: string[];
  status: "Ready" | "Processing" | "Failed";
  storageKey: string;
  storageFileId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DatasetRow {
  [key: string]: string | number;
}

export interface PaginatedDataResponse {
  success: boolean;
  data: {
    rows: DatasetRow[];
    total: number;
    page: number;
    limit: number;
    columns: string[];
  };
  message?: string;
}

export interface DatasetDataQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface DatasetDataResponse {
  success: boolean;
  data: {
    rows: DatasetRow[];
    total: number;
    page: number;
    limit: number;
    columns: string[];
  };
  message?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

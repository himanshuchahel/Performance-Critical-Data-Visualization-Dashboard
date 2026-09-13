import { apiFetch } from "./client";
import type { Dataset, DatasetRow, DatasetDataQuery } from "../types";

export interface DatasetListResponse {
  success: boolean;
  data: Dataset[];
  message?: string;
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

export async function listDatasets(query?: { search?: string; page?: number; limit?: number }): Promise<DatasetListResponse> {
  const params = new URLSearchParams();
  if (query?.search) params.append("search", query.search);
  if (query?.page) params.append("page", String(query.page));
  if (query?.limit) params.append("limit", String(query.limit));
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/datasets${qs}`, { method: "GET" });
}

export async function getDataset(id: string): Promise<{ success: boolean; data?: Dataset; message?: string }> {
  return apiFetch(`/datasets/${id}`, { method: "GET" });
}

export async function createDataset(file: File): Promise<{ success: boolean; data?: Dataset; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch("/datasets", {
    method: "POST",
    body: formData,
  });
}

export async function updateDataset(id: string, updates: Partial<Pick<Dataset, "name">>): Promise<{ success: boolean; data?: Dataset; message?: string }> {
  return apiFetch(`/datasets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function duplicateDataset(id: string): Promise<{ success: boolean; data?: Dataset; message?: string }> {
  return apiFetch(`/datasets/${id}/duplicate`, { method: "POST" });
}

export async function deleteDataset(id: string): Promise<{ success: boolean; message?: string }> {
  return apiFetch(`/datasets/${id}`, { method: "DELETE" });
}

export async function downloadDataset(id: string): Promise<Blob> {
  return apiFetch(`/datasets/${id}/download`, { method: "GET" }) as Promise<Blob>;
}

export async function getDatasetData(
  id: string,
  query?: DatasetDataQuery
): Promise<DatasetDataResponse> {
  const params = new URLSearchParams();
  if (query?.page) params.append("page", String(query.page));
  if (query?.limit) params.append("limit", String(query.limit));
  if (query?.search) params.append("search", query.search);
  if (query?.sortBy) params.append("sortBy", query.sortBy);
  if (query?.sortOrder) params.append("sortOrder", query.sortOrder);
  const qs = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/datasets/${id}/data${qs}`, { method: "GET" });
}

/**
 * DataForge Demo Data — Extended for Dataset Details workspace
 */
export type DatasetStatus = "Ready" | "Processing" | "Failed";
export type FileType = "CSV" | "JSON" | "Parquet";

export interface DatasetColumn {
  name: string;
  type: "String" | "Integer" | "Float" | "Date" | "Category" | "Numeric";
  nonNull: number; // count
  nullCount: number;
  unique: number;
  example: string | number;
}

export interface Dataset {
  id: string;
  name: string;
  type: FileType;
  rows: number;
  columns: number;
  size: number; // bytes
  status: DatasetStatus;
  updatedAt: Date;
  createdAt: Date;
  columnDefs?: DatasetColumn[];
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`;
}

export function formatRowCount(rows: number): string {
  if (rows < 1000) return rows.toString();
  if (rows < 1000000) return `${(rows / 1000).toFixed(1)}K`;
  return `${(rows / 1000000).toFixed(1)}M`;
}

export function formatRelativeTime(date: Date | string): string {
  const dateObj = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(dateObj.getTime())) {
    return "Unknown";
  }

  const now = new Date();
  const diff = now.getTime() - dateObj.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return dateObj.toLocaleDateString();
}

export const DEMO_DATASETS: Dataset[] = [
  {
    id: "ds_001",
    name: "sales_data.csv",
    type: "CSV",
    rows: 1234567,
    columns: 18,
    size: 44040192,
    status: "Ready",
    updatedAt: new Date(Date.now() - 2 * 60 * 1000),
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    columnDefs: [
      { name: "customer_id", type: "Integer", nonNull: 1234567, nullCount: 0, unique: 1200000, example: 10001 },
      { name: "name", type: "String", nonNull: 1233200, nullCount: 1367, unique: 920000, example: "John Doe" },
      { name: "revenue", type: "Float", nonNull: 1234567, nullCount: 0, unique: 890000, example: 1240.50 },
      { name: "region", type: "Category", nonNull: 1234567, nullCount: 0, unique: 6, example: "North" },
      { name: "status", type: "Category", nonNull: 1234567, nullCount: 0, unique: 3, example: "Active" },
    ],
  },
  {
    id: "ds_002",
    name: "iot_sensors.csv",
    type: "CSV",
    rows: 500000,
    columns: 9,
    size: 18874368,
    status: "Processing",
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_003",
    name: "website_traffic.json",
    type: "JSON",
    rows: 120000,
    columns: 14,
    size: 8388608,
    status: "Ready",
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_004",
    name: "user_events.parquet",
    type: "Parquet",
    rows: 5100000,
    columns: 22,
    size: 2516582400,
    status: "Ready",
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_005",
    name: "customer_demographics.csv",
    type: "CSV",
    rows: 842300,
    columns: 12,
    size: 25165824,
    status: "Ready",
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_006",
    name: "product_catalog.json",
    type: "JSON",
    rows: 45000,
    columns: 8,
    size: 3145728,
    status: "Ready",
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_007",
    name: "server_logs.csv",
    type: "CSV",
    rows: 3200000,
    columns: 16,
    size: 157286400,
    status: "Failed",
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: "ds_008",
    name: "marketing_campaign.json",
    type: "JSON",
    rows: 89000,
    columns: 20,
    size: 6291456,
    status: "Ready",
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
  },
];

export function getDatasetById(id: string): Dataset | undefined {
  return DEMO_DATASETS.find((ds) => ds.id === id);
}

export function filterDatasets(
  datasets: Dataset[],
  query: string,
  fileType: FileType | "All",
  status: DatasetStatus | "All"
): Dataset[] {
  return datasets.filter((ds) => {
    const matchesQuery = !query || ds.name.toLowerCase().includes(query.toLowerCase()) || ds.type.toLowerCase().includes(query.toLowerCase());
    const matchesType = fileType === "All" || ds.type === fileType;
    const matchesStatus = status === "All" || ds.status === status;
    return matchesQuery && matchesType && matchesStatus;
  });
}

export type SortField = "name" | "rows" | "size" | "updated";
export type SortDirection = "asc" | "desc";

export function sortDatasets(datasets: Dataset[], field: SortField, direction: SortDirection): Dataset[] {
  const sorted = [...datasets];
  sorted.sort((a, b) => {
    let comparison = 0;
    switch (field) {
      case "name": comparison = a.name.localeCompare(b.name); break;
      case "rows": comparison = a.rows - b.rows; break;
      case "size": comparison = a.size - b.size; break;
      case "updated": comparison = a.updatedAt.getTime() - b.updatedAt.getTime(); break;
    }
    return direction === "asc" ? comparison : -comparison;
  });
  return sorted;
}

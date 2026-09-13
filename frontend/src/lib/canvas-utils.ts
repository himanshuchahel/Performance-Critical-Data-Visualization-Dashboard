/**
 * DataForge — Custom high-performance visualization utilities
 * No external chart libraries (no Chart.js, D3, ECharts, Recharts)
 */

import type { DatasetColumn } from "./demo-data";

export interface Point2D {
  x: number;
  y: number;
}

export interface ChartConfig {
  type: "line" | "bar" | "scatter" | "heatmap";
  xAxis: string;
  yAxis: string;
  aggregation: "none" | "sum" | "avg" | "min" | "max" | "count";
  timeRange: "1H" | "6H" | "24H" | "7D" | "All";
}

export function aggregate(values: number[], windowMs: number, agg: "avg" | "sum" | "min" | "max" | "count"): number[] {
  const buckets: number[] = [];
  for (let i = 0; i < values.length; i += Math.max(1, Math.floor(windowMs / 10))) {
    const slice = values.slice(i, i + Math.max(1, Math.floor(windowMs / 10)));
    if (agg === "avg") buckets.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    else if (agg === "sum") buckets.push(slice.reduce((a, b) => a + b, 0));
    else if (agg === "min") buckets.push(Math.min(...slice));
    else if (agg === "max") buckets.push(Math.max(...slice));
    else buckets.push(slice.length);
  }
  return buckets;
}

export function getNumericColumns(columns: DatasetColumn[]): DatasetColumn[] {
  return columns.filter((c) => c.type === "Integer" || c.type === "Float" || c.type === "Numeric");
}

export function getCategoricalColumns(columns: DatasetColumn[]): DatasetColumn[] {
  return columns.filter((c) => c.type === "String" || c.type === "Category");
}

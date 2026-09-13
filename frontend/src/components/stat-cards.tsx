import {
  ArrowUp,
  Database,
  Layers,
  Gauge,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardsProps {
  totalDatasets: number;
  totalRows: number;
  totalStorage?: number;
  visualizationCount?: number;
  averageFps?: number;
  loading?: boolean;
}

function formatRows(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString();
}


export function StatCards({
  totalDatasets,
  totalRows,
  visualizationCount = 0,
  averageFps = 0,
  loading = false,
}: StatCardsProps) {
  const stats = [
    {
      label: "Total Datasets",
      value: loading ? "—" : totalDatasets.toLocaleString(),
      delta: "Backend data",
      icon: Database,
    },
    {
      label: "Total Rows",
      value: loading ? "—" : formatRows(totalRows),
      delta: "Across datasets",
      icon: Layers,
    },
    {
      label: "Visualizations",
      value: loading ? "—" : visualizationCount.toLocaleString(),
      delta: "Saved views",
      icon: Eye,
    },
    {
      label: "Average FPS",
      value: loading ? "—" : averageFps > 0 ? averageFps.toString() : "—",
      delta: averageFps > 0 ? "Rendering performance" : "Not measured yet",
      icon: Gauge,
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
      role="region"
      aria-label="Key metrics"
    >
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className={cn(
              "group rounded-xl border border-border bg-card p-4 shadow-sm",
              "hover:shadow-md hover:border-border/60 transition-all",
              "hover:-translate-y-0.5"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border group-hover:scale-105 transition-transform">
                <Icon className="h-4 w-4" />
              </div>

              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground">
                <ArrowUp className="h-3 w-3" />
                {stat.delta}
              </span>
            </div>

            <div className="text-2xl font-bold tracking-tight text-foreground leading-none">
              {stat.value}
            </div>

            <div className="text-xs text-muted-foreground mt-1 font-medium">
              {stat.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
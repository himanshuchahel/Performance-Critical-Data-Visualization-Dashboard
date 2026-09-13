import { ArrowUpRight, Database, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { listDatasets } from "@/api/datasets";
import type { Dataset as ApiDataset } from "@/types";
import { useEffect, useState } from "react";

const statusStyles = {
  Ready:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
  Processing:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
  Failed:
    "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800",
};

function formatRows(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toLocaleString();
}

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

function formatRelativeTime(date: string | Date) {
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

export function RecentDatasets() {
  const [datasets, setDatasets] = useState<ApiDataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRecentDatasets = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await listDatasets();

        if (response.success && Array.isArray(response.data)) {
          setDatasets(response.data.slice(0, 3));
        } else {
          setDatasets([]);
          setError(response.message || "Failed to load datasets.");
        }
      } catch (err: any) {
        console.error("Recent datasets error:", err);

        setDatasets([]);
        setError(
          err?.message || "Unable to load recent datasets."
        );
      } finally {
        setLoading(false);
      }
    };

    loadRecentDatasets();
  }, []);

  return (
    <section aria-labelledby="recent-datasets-heading">
      <div className="mb-4 flex items-center justify-between">
        <h2
          id="recent-datasets-heading"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Recent Datasets
        </h2>

        <a
          href="/datasets"
          className="inline-flex items-center gap-0.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
          <ArrowUpRight className="h-3 w-3" />
        </a>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="divide-y divide-border">

          {/* Loading */}
          {loading && (
            <>
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 px-4 py-3.5"
                >
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-lg bg-muted" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-56 animate-pulse rounded bg-muted" />
                  </div>

                  <div className="hidden h-3 w-16 animate-pulse rounded bg-muted sm:block" />
                </div>
              ))}
            </>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="px-4 py-8 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && !error && datasets.length === 0 && (
            <div className="px-4 py-8 text-center">
              <Database className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

              <p className="text-sm font-medium text-foreground">
                No datasets yet
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Upload a dataset to see it here.
              </p>
            </div>
          )}

          {/* Real backend datasets */}
          {!loading &&
            !error &&
            datasets.map((dataset) => {
              const type = dataset.fileType;
              const status = dataset.status;

              return (
                <a
                  key={dataset._id}
                  href={`/datasets/${dataset._id}`}
                  className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
                    {type === "JSON" ? (
                      <FileJson className="h-4 w-4" />
                    ) : (
                      <Database className="h-4 w-4" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground transition-colors group-hover:text-foreground">
                      {dataset.name}
                    </div>

                    <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{type}</span>

                      <span className="inline-block h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />

                      <span>
                        {formatRows(dataset.rowCount)} rows
                      </span>

                      <span className="inline-block h-0.5 w-0.5 rounded-full bg-muted-foreground/40" />

                      <span>
                        {dataset.columnCount} cols
                      </span>
                    </div>
                  </div>

                  <div className="hidden whitespace-nowrap text-xs text-muted-foreground sm:block">
                    {formatBytes(dataset.fileSize)}
                  </div>

                  <div className="hidden whitespace-nowrap text-xs text-muted-foreground md:block">
                    {formatRelativeTime(dataset.updatedAt)}
                  </div>

                  <span
                    className={cn(
                      "hidden rounded-full border px-2 py-0.5 text-[11px] font-medium sm:inline-flex",
                      statusStyles[status]
                    )}
                  >
                    {status}
                  </span>

                  <span className="whitespace-nowrap text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Open
                  </span>
                </a>
              );
            })}
        </div>
      </div>
    </section>
  );
}
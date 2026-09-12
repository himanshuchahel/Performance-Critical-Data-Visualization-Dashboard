import { useEffect, useMemo, useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";

import { CanvasRenderer } from "@/components/charts/CanvasRenderer";
import { Badge } from "@/components/ui/badge";

import {
  listDatasets,
  getDatasetData,
} from "@/api/datasets";

import type {
  Dataset,
  DatasetRow,
} from "@/types";

type ChartType =
  | "line"
  | "bar"
  | "scatter"
  | "heatmap";

type DatasetWithMongoId = Dataset & {
  _id?: string;
};

export default function VisualizationWorkspace() {
  const [chartType, setChartType] =
    useState<ChartType>("line");

  const [running, setRunning] =
    useState(true);
  const [datasets, setDatasets] =
    useState<DatasetWithMongoId[]>([]);

  const [selectedDatasetId, setSelectedDatasetId] =
    useState("");
  const [rows, setRows] =
    useState<DatasetRow[]>([]);

  const [columns, setColumns] =
    useState<string[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);

  const handleSelectAll = () => setSelectedColumns([...columns]);
  const handleClearAll = () => setSelectedColumns([]);

  const toggleColumn = (col: string) => {
    setSelectedColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };
  const [loading, setLoading] =
    useState(true);

  const [dataLoading, setDataLoading] =
    useState(false);

  const [error, setError] =
    useState("");
  const [xColumn, setXColumn] =
    useState("");

  const [yColumn, setYColumn] =
    useState("");
  const [fps, setFps] =
    useState(0);

  const [frameTime, setFrameTime] =
    useState(0);

  const [renderTime, setRenderTime] =
    useState(0);
  useEffect(() => {
    let cancelled = false;

    const loadDatasets = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await listDatasets();

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to load datasets"
          );
        }

        if (cancelled) {
          return;
        }

        const loadedDatasets =
          (response.data || []) as DatasetWithMongoId[];

        setDatasets(loadedDatasets);
        if (loadedDatasets.length > 0) {
          const firstDataset =
            loadedDatasets[0];

          const firstDatasetId =
            firstDataset.id ||
            firstDataset._id ||
            "";

          setSelectedDatasetId(
            firstDatasetId
          );
        } else {
          setSelectedDatasetId("");
        }
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load datasets"
        );

        setDatasets([]);
        setSelectedDatasetId("");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadDatasets();

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!selectedDatasetId) {
      setRows([]);
      setColumns([]);
      setXColumn("");
      setYColumn("");

      return;
    }

    let cancelled = false;

    const loadDatasetData = async () => {
      try {
        setDataLoading(true);
        setError("");

        setRows([]);
        setColumns([]);
        setXColumn("");
        setYColumn("");

        const response =
          await getDatasetData(
            selectedDatasetId,
            {
              page: 1,
              limit: 10000,
            }
          );

        if (!response.success) {
          throw new Error(
            response.message ||
              "Failed to load dataset data"
          );
        }

        if (cancelled) {
          return;
        }

        const loadedData = response.data;
        const loadedRows = loadedData?.rows || [];
        const loadedColumns = loadedData?.columns || [];

        setRows(loadedRows);
        setColumns(loadedColumns);
        // Default: select all numeric columns detected from actual API data
        setTimeout(() => {
          const numeric = loadedColumns.filter((col: string) => {
            const vals = loadedRows.slice(0, 100).map((r: any) => r[col]).filter((v: any) => v != null && v !== "");
            if (vals.length === 0) return false;
            const numericCount = vals.filter((v: any) => Number.isFinite(Number(v))).length;
            return numericCount / vals.length >= 0.8;
          });
          setSelectedColumns(numeric.length > 0 ? numeric : loadedColumns);
          if (numeric.length > 0) {
            setXColumn(numeric[0]);
            setYColumn(numeric.length > 1 ? numeric[1] : numeric[0]);
          } else {
            setXColumn("");
            setYColumn("");
          }
        }, 0);
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load dataset data"
        );

        setRows([]);
        setColumns([]);
        setXColumn("");
        setYColumn("");
      } finally {
        if (!cancelled) {
          setDataLoading(false);
        }
      }
    };

    loadDatasetData();

    return () => {
      cancelled = true;
    };
  }, [selectedDatasetId]);
  const numericColumns = useMemo(() => {
    return columns.filter((column) => {
      const values = rows
        .slice(0, 100)
        .map(
          (row) => row[column]
        )
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            value !== ""
        );

      if (values.length === 0) {
        return false;
      }

      const numericCount =
        values.filter((value) => {
          const number = Number(value);

          return Number.isFinite(number);
        }).length;

      return (
        numericCount /
          values.length >=
        0.8
      );
    });
  }, [columns, rows]);
  const orderedColumns = useMemo(() => {
    const numericSet =
      new Set(numericColumns);

    return [
      ...numericColumns,
      ...columns.filter(
        (column) =>
          !numericSet.has(column)
      ),
    ];
  }, [
    columns,
    numericColumns,
  ]);
  useEffect(() => {
    if (numericColumns.length === 0) {
      setXColumn("");
      setYColumn("");

      return;
    }

    setXColumn(
      numericColumns[0]
    );

    setYColumn(
      numericColumns.length > 1
        ? numericColumns[1]
        : numericColumns[0]
    );
  }, [numericColumns]);

  // ==================================================
  // CONVERT DATA FOR CANVAS
  // ==================================================

  const chartData = useMemo(() => {
    if (selectedColumns.length === 0) {
      return [];
    }
    const xCol = xColumn || selectedColumns[0] || "";
    const yCol = yColumn || selectedColumns[1] || selectedColumns[0] || "";
    if (!xCol || !yCol) return [];

    return rows
      .map((row, index) => {
        const xValue =
          Number(row[xColumn]);

        const yValue =
          Number(row[yColumn]);

        // Y must be numeric
        if (!Number.isFinite(yValue)) {
          return null;
        }

        return [
          Number.isFinite(xValue)
            ? xValue
            : index,
          yValue,
        ];
      })
      .filter(
        (
          value
        ): value is number[] =>
          value !== null
      );
  }, [
    rows,
    xColumn,
    yColumn,
  ]);
  const chartLabels = useMemo(() => {
    const col = xColumn || selectedColumns[0] || "";
    if (!col) return [];
    return rows.map((row, index) => {
      const value = row[col];
      if (value === null || value === undefined || value === "") return String(index);
      return String(value);
    });
  }, [rows, xColumn, selectedColumns[0]]);
  const { updatePerformance } = usePerformanceMetrics();

  const handlePerformanceUpdate = ({
    fps: nextFps,
    frameTime: nextFrameTime,
    renderTime: nextRenderTime,
  }: {
    fps: number;
    frameTime: number;
    renderTime: number;
  }) => {
    setFps(nextFps);
    setFrameTime(nextFrameTime);
    setRenderTime(nextRenderTime);
    updatePerformance({ fps: nextFps, frameTime: nextFrameTime, renderTime: nextRenderTime });
  };
  const resetChart = () => {
    setFps(0);
    setFrameTime(0);
    setRenderTime(0);
  };
  const handleDatasetChange = (
    datasetId: string
  ) => {
    setSelectedDatasetId(
      datasetId
    );

    resetChart();
  };
  const handleXColumnChange = (
    column: string
  ) => {
    setXColumn(column);

    resetChart();
  };
  const handleYColumnChange = (
    column: string
  ) => {
    setYColumn(column);

    resetChart();
  };
  const selectedDataset =
    datasets.find(
      (dataset) => {
        const datasetId =
          dataset.id ||
          dataset._id ||
          "";

        return (
          datasetId ===
          selectedDatasetId
        );
      }
    );
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Dataset
        </span>

        <select
          value={selectedDatasetId}
          onChange={(event) =>
            handleDatasetChange(
              event.target.value
            )
          }
          disabled={
            loading ||
            datasets.length === 0
          }
          className="h-8 max-w-[260px] rounded-md border border-border bg-background px-2 text-xs text-foreground outline-none"
        >
          {datasets.length === 0 ? (
            <option value="">
              No datasets
            </option>
          ) : (
            datasets.map(
              (dataset) => {
                const datasetId =
                  dataset.id ||
                  dataset._id ||
                  "";

                return (
                  <option
                    key={datasetId}
                    value={datasetId}
                  >
                    {dataset.name}
                  </option>
                );
              }
            )
          )}
        </select>
        <span className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Chart
        </span>

        {(
          [
            "line",
            "bar",
            "scatter",
            "heatmap",
          ] as const
        ).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              setChartType(type)
            }
            className={`h-7 rounded-md border px-2.5 text-xs font-medium transition-colors ${
              chartType === type
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-muted"
            }`}
          >
            {type}
          </button>
        ))}
        <button
          type="button"
          onClick={() =>
            setRunning(
              (value) => !value
            )
          }
          className="inline-flex h-7 items-center gap-1 rounded-md border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          aria-label={
            running
              ? "Pause rendering"
              : "Start rendering"
          }
        >
          {running ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}

          {running
            ? "Pause"
            : "Play"}
        </button>

        {/* RESET */}

        <button
          type="button"
          onClick={resetChart}
          className="inline-flex h-7 items-center justify-center rounded-md border border-border bg-background px-2 text-xs text-foreground hover:bg-muted"
          aria-label="Reset performance metrics"
        >
          <RotateCcw className="h-3 w-3" />
        </button>
        <Badge
          variant="outline"
          className="ml-auto"
        >
          {dataLoading
            ? "Loading dataset..."
            : selectedDatasetId &&
                selectedDataset
              ? "Dataset connected"
              : "No dataset"}
        </Badge>
      </div>
      {columns.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Chart Columns
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Choose the columns to plot.
              Numeric columns are
              prioritized by default.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">

              <label
                htmlFor="x-axis-column"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                X Axis
              </label>

              <select
                id="x-axis-column"
                value={xColumn}
                onChange={(event) =>
                  handleXColumnChange(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              >
                {orderedColumns.map(
                  (column) => {
                    const isNumeric =
                      numericColumns.includes(
                        column
                      );

                    return (
                      <option
                        key={column}
                        value={column}
                      >
                        {column}
                        {isNumeric
                          ? " • Numeric"
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

            {/* Y AXIS */}

            <div className="space-y-2">

              <label
                htmlFor="y-axis-column"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Y Axis
              </label>

              <select
                id="y-axis-column"
                value={yColumn}
                onChange={(event) =>
                  handleYColumnChange(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground"
              >
                {orderedColumns.map(
                  (column) => {
                    const isNumeric =
                      numericColumns.includes(
                        column
                      );

                    return (
                      <option
                        key={column}
                        value={column}
                      >
                        {column}
                        {isNumeric
                          ? " • Numeric"
                          : ""}
                      </option>
                    );
                  }
                )}
              </select>

            </div>

          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              Select All
            </button>

            <button
              type="button"
              onClick={handleClearAll}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium text-foreground hover:bg-muted"
            >
              Clear All
            </button>

            <span className="text-xs text-muted-foreground">
              {selectedColumns.length} / {columns.length} selected
            </span>

            <span className="ml-auto text-xs text-muted-foreground">
              {numericColumns.length}{" "}
              numeric{" "}
              {numericColumns.length === 1
                ? "column"
                : "columns"}{" "}
              detected
            </span>

            <span>•</span>

            <span>
              {rows.length.toLocaleString()}{" "}
              rows loaded
            </span>

          </div>
        </div>
      )}
      {columns.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-foreground">
            Column Selection
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {orderedColumns.map((column) => {
              const isNumeric = numericColumns.includes(column);
              const isSelected = selectedColumns.includes(column);
              return (
                <button
                  key={column}
                  type="button"
                  onClick={() => toggleColumn(column)}
                  className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-foreground hover:bg-muted"
                  }`}
                >
                  <span
                    className={`h-3 w-3 rounded border ${
                      isSelected
                        ? "border-background bg-background"
                        : "border-muted-foreground"
                    }`}
                  />
                  <span className="truncate">{column}</span>
                  {isNumeric && (
                    <span
                      className={`ml-auto text-[10px] ${
                        isSelected
                          ? "text-background/60"
                          : "text-muted-foreground"
                      }`}
                    >
                      #
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border border-border bg-[#0a0f1c] shadow-sm">

        {loading ||
        dataLoading ? (
          <div className="flex h-[360px] items-center justify-center text-sm text-muted-foreground">
            Loading chart data...
          </div>
        ) : chartData.length > 0 ? (
          <CanvasRenderer
            type={chartType}
            data={chartData}
            columns={columns}
            xColumn={xColumn}
            yColumn={yColumn}
            xLabels={chartLabels}
            width={860}
            height={360}
            showGrid
            animate={running}
            onPerformanceUpdate={
              handlePerformanceUpdate
            }
          />
        ) : (
          <div className="flex h-[360px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {numericColumns.length === 0
              ? "No numeric columns available in this dataset."
              : "No data available for the selected columns."}
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">
            Points
          </div>

          <div className="mt-1 text-lg font-bold text-foreground">
            {chartData.length.toLocaleString()}
          </div>

          <div className="text-xs text-muted-foreground">
            Rendered
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">
            FPS
          </div>

          <div className="mt-1 text-lg font-bold text-foreground">
            {fps > 0
              ? fps.toFixed(2)
              : "—"}
          </div>

          <div className="text-xs text-muted-foreground">
            Chart rendering
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">
            Frame Time
          </div>

          <div className="mt-1 text-lg font-bold text-foreground">
            {frameTime > 0
              ? `${frameTime.toFixed(2)}ms`
              : "—"}
          </div>

          <div className="text-xs text-muted-foreground">
            Per chart frame
          </div>
        </div>

        {/* RENDER TIME */}

        <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
          <div className="text-xs text-muted-foreground">
            Render Time
          </div>

          <div className="mt-1 text-lg font-bold text-foreground">
            {renderTime > 0
              ? `${renderTime.toFixed(2)}ms`
              : "—"}
          </div>

          <div className="text-xs text-muted-foreground">
            Canvas render
          </div>
        </div>

      </div>


      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">

        <h3 className="mb-3 text-base font-semibold text-foreground">
          Performance Metrics
        </h3>

        <div className="space-y-2 text-sm">

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              Dataset
            </span>

            <span className="max-w-[60%] truncate font-medium text-foreground">
              {selectedDataset?.name ||
                "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              Source rows
            </span>

            <span className="font-medium text-foreground">
              {rows.length.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              Rendered points
            </span>

            <span className="font-medium text-foreground">
              {chartData.length.toLocaleString()}{" "}
              (downsampled)
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              X axis
            </span>

            <span className="max-w-[60%] truncate font-medium text-foreground">
              {xColumn || "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              Y axis
            </span>

            <span className="max-w-[60%] truncate font-medium text-foreground">
              {yColumn || "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              FPS
            </span>

            <span className="font-medium text-foreground">
              {fps > 0
                ? fps.toFixed(2)
                : "—"}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-border/40 py-1.5">
            <span className="text-muted-foreground">
              Frame time
            </span>
            <span className="font-medium text-foreground">
              {frameTime > 0
                ? `${frameTime.toFixed(2)}ms`
                : "—"}
            </span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-muted-foreground">
              Render time
            </span>
            <span className="font-medium text-foreground">
              {renderTime > 0
                ? `${renderTime.toFixed(2)}ms`
                : "—"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
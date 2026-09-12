import React from "react";
import {
  BarChart3,
  LineChart,
  AreaChart,
  ScatterChart,
  Grid3X3,
  Activity,
  RefreshCw,
} from "lucide-react";
import {
  getDataset,
  getDatasetData,
} from "@/api/datasets";
import { CanvasRenderer } from "./CanvasRenderer";
import type { Dataset } from "@/types";

interface DatasetVisualizationProps {
  datasetId: string;
}

type ChartType =
  | "line"
  | "smooth-line"
  | "area"
  | "bar"
  | "scatter"
  | "heatmap"
  | "histogram";

interface Row {
  [key: string]: unknown;
}

const chartTypes: {
  type: ChartType;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    type: "line",
    label: "Line",
    icon: LineChart,
  },
  {
    type: "smooth-line",
    label: "Smooth",
    icon: Activity,
  },
  {
    type: "area",
    label: "Area",
    icon: AreaChart,
  },
  {
    type: "bar",
    label: "Bar",
    icon: BarChart3,
  },
  {
    type: "scatter",
    label: "Scatter",
    icon: ScatterChart,
  },
  {
    type: "heatmap",
    label: "Heatmap",
    icon: Grid3X3,
  },
  {
    type: "histogram",
    label: "Histogram",
    icon: BarChart3,
  },
];

function isNumeric(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return false;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number);
}

function toNumber(value: unknown) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return 0;
  }

  const number =
    typeof value === "number"
      ? value
      : Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

export function DatasetVisualization({
  datasetId,
}: DatasetVisualizationProps) {
  const [dataset, setDataset] =
    React.useState<
      Dataset | undefined
    >(undefined);

  const [rows, setRows] =
    React.useState<Row[]>([]);

  const [columns, setColumns] =
    React.useState<string[]>([]);

  const [numericColumns, setNumericColumns] =
    React.useState<string[]>([]);

  const [xColumn, setXColumn] =
    React.useState("");

  const [yColumn, setYColumn] =
    React.useState("");

  const [chartType, setChartType] =
    React.useState<ChartType>("line");

  const [loading, setLoading] =
    React.useState(true);

  const [error, setError] =
    React.useState("");

  const [fps, setFps] =
    React.useState(0);

  const [frameTime, setFrameTime] =
    React.useState(0);

  const loadDataset =
    React.useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const [
            datasetResponse,
            dataResponse,
          ] = await Promise.all([
            getDataset(datasetId),
            getDatasetData(
              datasetId,
              {
                page: 1,
                limit: 10000,
              }
            ),
          ]);

          const datasetData =
            datasetResponse.data;

          const responseData =
            dataResponse.data;

          if (!datasetData) {
            throw new Error(
              datasetResponse.message ||
                "Dataset not found"
            );
          }

          if (!responseData) {
            throw new Error(
              dataResponse.message ||
                "Dataset data not found"
            );
          }

          setDataset(datasetData);

          const nextRows =
            responseData.rows || [];

          const nextColumns =
            responseData.columns || [];

          setRows(nextRows);
          setColumns(nextColumns);

          const detectedNumericColumns =
            nextColumns.filter(
              (column) => {
                const sample =
                  nextRows
                    .slice(0, 100)
                    .map(
                      (row) =>
                        row[column]
                    )
                    .filter(
                      (value) =>
                        value !==
                          null &&
                        value !==
                          undefined &&
                        value !== ""
                    );

                if (
                  !sample.length
                ) {
                  return false;
                }

                return (
                  sample.filter(
                    isNumeric
                  ).length /
                    sample.length >=
                  0.8
                );
              }
            );

          setNumericColumns(
            detectedNumericColumns
          );

          if (
            detectedNumericColumns.length >=
            2
          ) {
            setXColumn(
              detectedNumericColumns[0]
            );

            setYColumn(
              detectedNumericColumns[1]
            );
          } else if (
            detectedNumericColumns.length ===
            1
          ) {
            setXColumn(
              detectedNumericColumns[0]
            );

            setYColumn(
              detectedNumericColumns[0]
            );
          } else {
            setXColumn(
              nextColumns[0] || ""
            );

            setYColumn(
              nextColumns[1] ||
                nextColumns[0] ||
                ""
            );
          }
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load dataset"
          );
        } finally {
          setLoading(false);
        }
      },
      [datasetId]
    );

  React.useEffect(() => {
    loadDataset();
  }, [loadDataset]);

  const chartData =
    React.useMemo(() => {
      if (
        !xColumn ||
        !yColumn
      ) {
        return [];
      }

      return rows
        .map((row, index) => {
          const xValue =
            row[xColumn];

          const yValue =
            row[yColumn];

          if (
            chartType !==
              "heatmap" &&
            chartType !==
              "histogram"
          ) {
            if (
              !isNumeric(
                xValue
              ) ||
              !isNumeric(
                yValue
              )
            ) {
              return null;
            }
          }

          return [
            isNumeric(xValue)
              ? toNumber(xValue)
              : index,
            toNumber(yValue),
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
      chartType,
    ]);

  const chartLabels =
    React.useMemo(() => {
      if (!xColumn) {
        return [];
      }

      return rows.map((row) => {
        const value =
          row[xColumn];

        return value === null ||
          value === undefined
          ? ""
          : String(value);
      });
    }, [rows, xColumn]);

  const handlePerformanceUpdate =
    React.useCallback(
      (metrics: {
        fps: number;
        frameTime: number;
      }) => {
        setFps(metrics.fps);
        setFrameTime(
          metrics.frameTime
        );
      },
      []
    );

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Loading dataset...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-card p-6">
        <div className="text-sm font-semibold text-destructive">
          Failed to load dataset
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          {error}
        </p>

        <button
          type="button"
          onClick={loadDataset}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-6 py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Visualization
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {dataset?.name ||
                "Dataset"}{" "}
              ·{" "}
              {rows.length.toLocaleString()}{" "}
              rows
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Chart FPS
              </div>

              <div className="text-sm font-semibold text-foreground">
                {fps > 0
                  ? fps.toFixed(2)
                  : "—"}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Frame Time
              </div>

              <div className="text-sm font-semibold text-foreground">
                {frameTime > 0
                  ? `${frameTime.toFixed(
                      2
                    )}ms`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-muted/20 px-6 py-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <div>
            <label
              htmlFor="chart-type"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Chart Type
            </label>

            <select
              id="chart-type"
              value={chartType}
              onChange={(event) =>
                setChartType(
                  event.target
                    .value as ChartType
                )
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              {chartTypes.map(
                (item) => (
                  <option
                    key={item.type}
                    value={item.type}
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="x-column"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              X Axis
            </label>

            <select
              id="x-column"
              value={xColumn}
              onChange={(event) =>
                setXColumn(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              {columns.map(
                (column) => (
                  <option
                    key={column}
                    value={column}
                  >
                    {column}
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="y-column"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Y Axis
            </label>

            <select
              id="y-column"
              value={yColumn}
              onChange={(event) =>
                setYColumn(
                  event.target.value
                )
              }
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary"
            >
              {columns.map(
                (column) => (
                  <option
                    key={column}
                    value={column}
                  >
                    {column}
                  </option>
                )
              )}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {chartTypes.map(
            ({
              type,
              label,
              icon: Icon,
            }) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setChartType(type)
                }
                className={[
                  "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition",
                  chartType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                ].join(" ")}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            )
          )}
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {!xColumn ||
        !yColumn ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">
              Select X and Y columns
              to visualize the
              dataset.
            </p>
          </div>
        ) : chartData.length ===
          0 ? (
          <div className="flex min-h-[500px] items-center justify-center rounded-xl border border-dashed border-border">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                No numeric data
                available
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Select columns
                containing numeric
                values.
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-border">
            <CanvasRenderer
              type={chartType}
              data={chartData}
              columns={columns}
              xColumn={xColumn}
              yColumn={yColumn}
              xLabels={chartLabels}
              width={900}
              height={520}
              showGrid
              animate={false}
              onPerformanceUpdate={
                handlePerformanceUpdate
              }
            />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-border bg-muted/20 px-6 py-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div>
          X:{" "}
          <span className="font-medium text-foreground">
            {xColumn || "—"}
          </span>
          {" · "}
          Y:{" "}
          <span className="font-medium text-foreground">
            {yColumn || "—"}
          </span>
        </div>

        <div>
          {numericColumns.length}{" "}
          numeric columns ·{" "}
          {columns.length} total
          columns
        </div>
      </div>
    </section>
  );
}
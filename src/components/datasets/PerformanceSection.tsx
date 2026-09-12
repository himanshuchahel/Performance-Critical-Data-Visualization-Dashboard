import { Clock, Database, Gauge, Timer, Zap } from "lucide-react";

interface PerformanceSectionProps {
  fps: number;
  frameTime: number;
  renderTime: number;
  dataPoints: number;
  sourceRows: number;
  selectedColumns?: string[];
  xColumn?: string;
  yColumn?: string;
}

export default function PerformanceSection({
  fps,
  frameTime,
  renderTime,
  dataPoints,
  sourceRows,
  selectedColumns = [],
  xColumn = "",
  yColumn = "",
}: PerformanceSectionProps) {
  const formatNumber = (value: number) =>
    value.toLocaleString();

  const formatMetric = (
    value: number,
    suffix = ""
  ) =>
    value > 0
      ? `${value.toFixed(2)}${suffix}`
      : "—";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard
          icon={Gauge}
          label="FPS"
          value={formatMetric(fps)}
          sub="Chart rendering"
        />

        <MetricCard
          icon={Timer}
          label="Frame time"
          value={formatMetric(frameTime, "ms")}
          sub="Per chart frame"
        />

        <MetricCard
          icon={Zap}
          label="Render time"
          value={formatMetric(renderTime, "ms")}
          sub="Canvas render"
        />

        <MetricCard
          icon={Database}
          label="Data points"
          value={formatNumber(dataPoints)}
          sub="Currently rendered"
        />
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Performance Metrics
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Live metrics from the active Canvas chart.
            </p>
          </div>

          <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <MetricRow
            label="Source rows"
            value={formatNumber(sourceRows)}
          />

          <MetricRow
            label="Rendered points"
            value={`${formatNumber(dataPoints)} (Canvas)`}
          />

          <MetricRow
            label="Selected columns"
            value={
              selectedColumns.length > 0
                ? selectedColumns.length.toString()
                : "—"
            }
          />

          <MetricRow
            label="X axis"
            value={xColumn || "—"}
          />

          <MetricRow
            label="Y axis"
            value={yColumn || "—"}
          />

          <MetricRow
            label="FPS"
            value={formatMetric(fps)}
          />

          <MetricRow
            label="Frame time"
            value={formatMetric(frameTime, "ms")}
          />

          <MetricRow
            label="Canvas render time"
            value={formatMetric(renderTime, "ms")}
          />
        </div>

        <div className="mt-4 rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />

            <div>
              <p className="font-medium text-foreground">
                Processing details
              </p>

              <p className="mt-0.5 leading-5">
                Processing, aggregation and filtering
                timings are not reported yet because
                the current API does not return those
                measurements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value: string;
  sub: string;
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      </div>

      <div className="mt-2 text-2xl font-bold text-foreground">
        {value}
      </div>

      <div className="text-xs text-muted-foreground">
        {sub}
      </div>
    </div>
  );
}

interface MetricRowProps {
  label: string;
  value: string;
}

function MetricRow({
  label,
  value,
}: MetricRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/40 py-2 last:border-0">
      <span className="text-muted-foreground">
        {label}
      </span>

      <span className="max-w-[60%] truncate text-right font-medium text-foreground">
        {value}
      </span>
    </div>
  );
}
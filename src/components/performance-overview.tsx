import { useEffect, useState } from "react";
import {
  BarChart3,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

const filters = [
  { label: "1H", value: "1h" },
  { label: "6H", value: "6h" },
  { label: "24H", value: "24h" },
  { label: "7D", value: "7d" },
];

const labels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"];

export function PerformanceOverview() {
  const [filter, setFilter] = useState("1h");
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>([]);

  // Measure real browser FPS
  useEffect(() => {
    let animationFrameId: number;
    let frameCount = 0;
    let lastTime = performance.now();

    const measureFPS = (currentTime: number) => {
      frameCount++;

      const elapsed = currentTime - lastTime;

      if (elapsed >= 1000) {
        const measuredFPS = Math.round(
          (frameCount * 1000) / elapsed
        );

        // Browser FPS is capped to a reasonable display range
        const safeFPS = Math.min(Math.max(measuredFPS, 0), 240);

        setFps(safeFPS);

        setFpsHistory((previous) => {
          const updated = [...previous, safeFPS];

          // Keep last 30 measurements
          return updated.slice(-30);
        });

        frameCount = 0;
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(measureFPS);
    };

    animationFrameId = requestAnimationFrame(measureFPS);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const frameTime = fps > 0 ? 1000 / fps : 0;

  // Use actual FPS measurements for the chart.
  // If there aren't enough measurements yet, fill with current FPS.
  const values = Array.from({ length: 7 }, (_, index) => {
    if (fpsHistory.length === 0) {
      return fps;
    }

    return fpsHistory[
      Math.max(0, fpsHistory.length - 7 + index)
    ] ?? fps;
  });

  const max = Math.max(...values, 1);

  const averageFPS =
    fpsHistory.length > 0
      ? Math.round(
          fpsHistory.reduce((sum, value) => sum + value, 0) /
            fpsHistory.length
        )
      : fps;

  return (
    <section
      aria-labelledby="perf-heading"
      className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h2
            id="perf-heading"
            className="text-base font-semibold tracking-tight text-foreground"
          >
            Performance Overview
          </h2>

          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time browser rendering metrics.
          </p>
        </div>

        <div
          className="flex gap-1 bg-muted rounded-lg p-0.5"
          role="group"
          aria-label="Time filters"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "text-xs font-medium px-2 py-1 rounded-md transition-all",
                filter === f.value
                  ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Metric
            label="FPS"
            value={`${averageFPS}`}
            sub="Avg rendering"
            icon={Zap}
          />

          <Metric
            label="Frame Time"
            value={`${frameTime.toFixed(2)}ms`}
            sub="Per frame"
            icon={Clock}
          />

          <Metric
            label="Render Time"
            value={
              fps > 0
                ? `${Math.max(1, Math.round(frameTime * 7))}ms`
                : "0ms"
            }
            sub="Estimated pipeline"
            icon={BarChart3}
          />
        </div>

        {/* SVG chart */}
        <div
          className="relative h-48 w-full"
          aria-label={`Performance chart for ${filter}`}
        >
          <svg
            viewBox="0 0 420 160"
            className="w-full h-full"
            preserveAspectRatio="none"
            role="img"
          >
            <defs>
              <linearGradient
                id="areaGrad"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="0%"
                  stopColor="currentColor"
                  stopOpacity="0.15"
                />

                <stop
                  offset="100%"
                  stopColor="currentColor"
                  stopOpacity="0"
                />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 1, 2, 3].map((i) => (
              <line
                key={i}
                x1="0"
                y1={i * 40 + 10}
                x2="420"
                y2={i * 40 + 10}
                stroke="currentColor"
                strokeOpacity="0.08"
                strokeDasharray="4 4"
              />
            ))}

            {/* Area */}
            <path
              d={`M 0 ${
                160 - (values[0] / max) * 120 - 10
              } ${values
                .map(
                  (value, index) =>
                    `L ${index * 60 + 30} ${
                      160 - (value / max) * 120 - 10
                    }`
                )
                .join(" ")} L 420 160 Z`}
              fill="url(#areaGrad)"
              className="text-foreground"
            />

            {/* Line */}
            <path
              d={`M 30 ${
                160 - (values[0] / max) * 120 - 10
              } ${values
                .map(
                  (value, index) =>
                    `L ${index * 60 + 30} ${
                      160 - (value / max) * 120 - 10
                    }`
                )
                .join(" ")}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
              strokeOpacity="0.9"
            />

            {/* Points */}
            {values.map((value, index) => (
              <circle
                key={index}
                cx={index * 60 + 30}
                cy={160 - (value / max) * 120 - 10}
                r="3.5"
                fill="currentColor"
                className="text-foreground"
              />
            ))}
          </svg>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 text-[10px] text-muted-foreground font-mono">
            {labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-2">
          FPS is measured from the browser's actual animation frames.
        </p>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Zap;
}) {
  return (
    <div className="rounded-xl bg-muted/40 border border-border/60 px-3 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />

        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
      </div>

      <div className="text-xl font-bold tracking-tight text-foreground leading-none">
        {value}
      </div>

      <div className="text-[11px] text-muted-foreground mt-1">
        {sub}
      </div>
    </div>
  );
}
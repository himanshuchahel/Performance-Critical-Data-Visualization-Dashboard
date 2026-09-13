import { Gauge, Zap, Waves, Database } from "lucide-react";
import { usePerformanceMetrics } from "@/hooks/usePerformanceMetrics";

export function PerformanceLab() {
  const { fps, frameTime } = usePerformanceMetrics();

  return (
    <section
      aria-labelledby="perf-lab-heading"
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      <div className="border-b border-border px-6 py-5">
        <h2 id="perf-lab-heading" className="text-xl font-bold tracking-tight text-foreground">
          Performance Lab
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor real browser rendering performance from the active Canvas chart.
        </p>
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Rendering Performance</h3>
            <span className="flex items-center gap-1.5 text-xs text-emerald-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="FPS" value={fps > 0 ? fps.toFixed(2) : "—"} sub="Active chart FPS" icon={Gauge} live />
            <MetricCard label="Frame Time" value={frameTime > 0 ? `${frameTime.toFixed(2)}ms` : "—"} sub="Per chart frame" icon={Zap} live />
            <MetricCard label="Rendered Points" value="—" sub="Not reported yet" icon={Waves} />
            <MetricCard label="Source Points" value="—" sub="Not reported yet" icon={Database} />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Worker Processing</h3>
            <span className="text-xs text-muted-foreground">Pipeline</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard label="Downsampling" value="—" sub="Not measured" icon={Gauge} />
            <MetricCard label="Streaming" value="Enabled" sub="Real-time pipeline" icon={Zap} />
            <MetricCard label="Worker Threads" value="—" sub="Not measured" icon={Waves} />
            <MetricCard label="Batch Size" value="—" sub="Not measured" icon={Database} />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 border-t border-border bg-muted/30 px-6 py-4 text-xs text-muted-foreground">
        <span className="inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
        <span>
          <strong className="font-semibold text-foreground">Live metrics</strong> — FPS and frame time are measured directly from the active Canvas chart via <code>onPerformanceUpdate</code>.
        </span>
      </div>
    </section>
  );
}

function MetricCard({ label, value, sub, icon: Icon, live = false }: { label: string; value: string; sub: string; icon: typeof Gauge; live?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3 shadow-sm transition-colors hover:bg-muted/30">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{label}</span>
        {live && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      </div>
      <div className="text-lg font-bold leading-none tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}

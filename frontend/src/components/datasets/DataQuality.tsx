import { AlertTriangle, Repeat, CheckCircle, Hash, CalendarClock } from "lucide-react";
import type { Dataset } from "@/lib/demo-data";

interface Props { dataset?: Dataset; }

export function DataQuality({ dataset }: Props) {
  const missing = dataset?.columnDefs ? Math.round(dataset.columnDefs.reduce((s, c) => s + c.nullCount, 0) / (dataset.columns * dataset.rows) * 100) : 2;
  const duplicates = 0.3;
  const numeric = dataset?.columnDefs ? dataset.columnDefs.filter((c) => c.type === "Integer" || c.type === "Float").length : 2;
  const date = dataset?.columnDefs ? dataset.columnDefs.filter((c) => c.type === "Date").length : 1;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-5">
      <h2 className="text-base font-semibold text-foreground mb-4">Data Quality</h2>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: AlertTriangle, label: "Missing values", val: `${missing}%`, desc: "Cells with null", color: missing > 5 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
          { icon: Repeat, label: "Duplicate rows", val: `${duplicates}%`, desc: "Exact duplicates", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
          { icon: CheckCircle, label: "Valid rows", val: "99.7%", desc: "Pass validation", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
          { icon: Hash, label: "Numeric columns", val: numeric.toString(), desc: "Numeric fields", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300" },
          { icon: CalendarClock, label: "Date/time", val: date.toString(), desc: "Temporal fields", color: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
        ].map((m) => (
          <div key={m.label} className={`rounded-lg border border-border p-3 ${m.color}`}>
            <div className="flex items-center gap-2 mb-2"><m.icon className="h-4 w-4" /><span className="text-xs font-semibold uppercase tracking-wider">{m.label}</span></div>
            <div className="text-xl font-bold">{m.val}</div>
            <div className="text-xs opacity-80">{m.desc}</div>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1"><span>Completeness</span><span>{100 - missing}%</span></div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{width: `${100 - missing}%`}} /></div>
      </div>
    </div>
  );
}

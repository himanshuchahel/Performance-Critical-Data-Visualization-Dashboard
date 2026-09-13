
import { Database, Columns, FileText, Clock, Flame } from "lucide-react";

import type { Dataset } from "@/lib/demo-data";
import { formatBytes, formatRowCount, formatRelativeTime } from "@/lib/demo-data";

interface Props { dataset?: Dataset; }

export function DatasetSummary({ dataset }: Props) {
  if (!dataset) return null;

  const missing = dataset.columnDefs ? Math.round(dataset.columnDefs.reduce((s, c) => s + c.nullCount, 0) / (dataset.columns * dataset.rows) * 100) : 2;
  const types = new Set(dataset.columnDefs?.map((c) => c.type) || ["String", "Integer"]);

  const metrics = [
    { icon: Database, label: "Rows", value: formatRowCount(dataset.rows), sub: "Total records" },
    { icon: Columns, label: "Columns", value: dataset.columns.toString(), sub: "Fields" },
    { icon: FileText, label: "Size", value: formatBytes(dataset.size), sub: "On disk" },
    { icon: Flame, label: "Data types", value: types.size.toString(), sub: "Distinct" },
    { icon: Clock, label: "Missing values", value: `${missing}%`, sub: "Across columns" },
    { icon: Clock, label: "Updated", value: formatRelativeTime(dataset.updatedAt), sub: "Last change" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {metrics.map((m) => (
        <div key={m.label} className="rounded-xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center"><m.icon className="h-3.5 w-3.5 text-muted-foreground" /></div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.label}</span>
          </div>
          <div className="text-lg font-bold text-foreground">{m.value}</div>
          <div className="text-xs text-muted-foreground">{m.sub}</div>
        </div>
      ))}
    </div>
  );
}

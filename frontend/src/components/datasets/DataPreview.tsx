import React from "react";
import { ArrowUpDown, Search, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DataRow {
  [key: string]: string | number;
}

export interface DataPreviewProps {
  datasetId?: string;
  rows?: DataRow[];
  columns?: string[];
  totalRows?: number;
}


const sampleRows: DataRow[] = [
  { customer_id: 10001, name: "John Smith", revenue: 1240.5, region: "North", status: "Active" },
  { customer_id: 10002, name: "Sarah Jones", revenue: 980.2, region: "South", status: "Active" },
  { customer_id: 10003, name: "Alex Rivera", revenue: 430.0, region: "West", status: "Inactive" },
  { customer_id: 10004, name: "Emily Chen", revenue: 2150.75, region: "East", status: "Active" },
  { customer_id: 10005, name: "David Park", revenue: 310.4, region: "North", status: "Inactive" },
  { customer_id: 10006, name: "Maria Garcia", revenue: 1780.9, region: "South", status: "Active" },
];

export function DataPreview({ rows = sampleRows, columns = ["customer_id", "name", "revenue", "region", "status"], totalRows = 1234567 }: DataPreviewProps) {
  const [search, setSearch] = React.useState("");
  const [visibleCols, setVisibleCols] = React.useState<string[]>(columns);

  const filtered = React.useMemo(() => {
    if (!search) return rows;
    const s = search.toLowerCase();
    return rows.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(s)));
  }, [rows, search]);

  const toggleCol = (c: string) => {
    setVisibleCols((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 border-b border-border bg-muted/40">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rows..."
            className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Showing {filtered.length} of {totalRows.toLocaleString()} rows</span>
        </div>
        <div className="flex gap-1">
          {columns.map((c) => (
            <button
              key={c}
              onClick={() => toggleCol(c)}
              aria-label={`${visibleCols.includes(c) ? "Hide" : "Show"} ${c}`}
              className={cn(
                "h-7 px-2 rounded-md text-xs font-medium border transition-colors",
                visibleCols.includes(c) ? "bg-background border-border text-foreground hover:bg-muted" : "bg-muted/60 border-border/50 text-muted-foreground hover:text-foreground"
              )}
            >
              {visibleCols.includes(c) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Data preview">
          <thead className="bg-muted/60 border-b border-border sticky top-0 z-10">
            <tr>
              {visibleCols.map((c) => (
                <th key={c} scope="col" className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap">
                  <span className="inline-flex items-center gap-1">{c} <ArrowUpDown className="h-3 w-3 opacity-40" /></span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r, i) => (
              <tr key={i} className="hover:bg-muted/40 transition-colors">
                {visibleCols.map((c) => (
                  <td key={c} className="px-3 py-2 whitespace-nowrap text-foreground">{String(r[c] ?? "—")}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

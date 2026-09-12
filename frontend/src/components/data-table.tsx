import React from "react";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

const cols = [
  { key: "name", label: "Name", sortable: true },
  { key: "date", label: "Date", sortable: true },
  { key: "region", label: "Region", sortable: true },
  { key: "sales", label: "Sales", sortable: true, align: "right" },
  { key: "units", label: "Units", sortable: true, align: "right" },
];
const rows = Array.from({ length: 8 }, (_, i) => ({
  name: `txn-${1000 + i}`,
  date: `2026-09-${10 - i}`,
  region: ["NA", "EU", "APAC", "LATAM"][i % 4],
  sales: (12400 + i * 3200).toLocaleString(),
  units: Math.floor(340 + i * 120),
}));

export function DataTable() {
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" }>({ key: "date", dir: "desc" });

  const sorted = React.useMemo(() => {
    const arr = [...rows];
    arr.sort((a, b) => {
      const av = a[sort.key as keyof typeof a];
      const bv = b[sort.key as keyof typeof b];
      if (typeof av === "string" && typeof bv === "string") return sort.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return 0;
    });
    return arr;
  }, [sort]);

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" role="region" aria-label="Dataset preview table">
      <table className="w-full text-sm" role="table" aria-label="Data preview">
        <thead className="bg-muted/60 border-b border-border">
          <tr>
            {cols.map((c) => (
              <th
                key={c.key}
                scope="col"
                onClick={() => c.sortable && setSort({ key: c.key, dir: sort.dir === "asc" ? "desc" : "asc" })}
                className={cn(
                  "px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left select-none",
                  c.sortable ? "cursor-pointer hover:text-foreground transition-colors" : ""
                )}
              >
                <span className={cn("inline-flex items-center gap-1", c.align === "right" ? "flex-row-reverse" : "")}>
                  {c.label}
                  {c.sortable && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {sorted.map((r) => (
            <tr key={r.name} className="hover:bg-muted/40 transition-colors">
              <td className="px-4 py-2.5 font-mono text-xs text-foreground">{r.name}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.date}</td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.region}</td>
              <td className="px-4 py-2.5 text-xs text-right font-mono text-foreground">{r.sales}</td>
              <td className="px-4 py-2.5 text-xs text-right font-mono text-foreground">{r.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-border bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
        <span>Showing {sorted.length} rows</span>
        <span className="font-mono">Virtualized preview — millions of rows supported</span>
      </div>
    </div>
  );
}

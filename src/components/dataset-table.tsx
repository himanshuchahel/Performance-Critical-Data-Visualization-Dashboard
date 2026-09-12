import { Database, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const datasets = [
  { name: "sales_data.csv", type: "CSV", rows: "842,300", cols: 14, size: "124 MB", status: "Ready", updated: "2h ago" },
  { name: "iot_sensors.csv", type: "CSV", rows: "1.2M", cols: 6, size: "890 MB", status: "Processing", updated: "4h ago" },
  { name: "website_traffic.json", type: "JSON", rows: "320,450", cols: 9, size: "45 MB", status: "Ready", updated: "12m ago" },
  { name: "user_events.parquet", type: "Parquet", rows: "5.1M", cols: 22, size: "2.4 GB", status: "Ready", updated: "1d ago" },
];

export function DatasetTable() {
  // Hover state for rows
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden" role="region" aria-label="Datasets table">
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Datasets">
          <thead className="bg-muted/60 border-b border-border">
            <tr>
              {["Name", "Type", "Rows", "Columns", "Size", "Status", "Updated", "Actions"].map((h) => (
                <th key={h} scope="col" className="px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {datasets.map((d) => (
              <tr
                key={d.name}
                // hover
                // leave
                className="hover:bg-muted/40 transition-colors"
              >
                <td className="px-4 py-3">
                  <a href="#" className="flex items-center gap-2.5 group">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
                      <Database className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[12rem]">{d.name}</span>
                  </a>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{d.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{d.rows}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground font-mono whitespace-nowrap">{d.cols}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{d.size}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border ${d.status === "Ready" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800" : d.status === "Processing" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800" : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800"}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{d.updated}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <a href="#" className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="Open dataset">Open</a>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" aria-label="More actions">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-[10rem]">
                        <DropdownMenuItem>Rename</DropdownMenuItem>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

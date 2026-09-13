
// lucide icons not used in this component
import { Badge } from "@/components/ui/badge";
import type { DatasetColumn } from "@/lib/demo-data";

interface Props { columns?: DatasetColumn[]; totalRows?: number; }

export function ColumnOverview({ columns, totalRows = 1234567 }: Props) {
  const cols = columns || [
    { name: "customer_id", type: "Integer", nonNull: 1234567, nullCount: 0, unique: 1200000, example: 10001 },
    { name: "name", type: "String", nonNull: 1233200, nullCount: 1367, unique: 920000, example: "John Doe" },
    { name: "revenue", type: "Float", nonNull: 1234567, nullCount: 0, unique: 890000, example: 1240.50 },
    { name: "region", type: "Category", nonNull: 1234567, nullCount: 0, unique: 6, example: "North" },
    { name: "status", type: "Category", nonNull: 1234567, nullCount: 0, unique: 3, example: "Active" },
  ];

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/30">
        <h2 className="text-base font-semibold text-foreground">Column Overview</h2>
        <p className="text-xs text-muted-foreground">Schema and statistics for each column</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm" role="table" aria-label="Column overview">
          <thead className="bg-muted/60 border-b border-border">
            <tr>
              {["Column", "Type", "Non-null", "Null", "Unique", "Example"].map((h) => (
                <th key={h} scope="col" className="px-3 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cols.map((c) => {
              const pct = Math.round((c.nonNull / totalRows) * 100);
              return (
                <tr key={c.name} className="hover:bg-muted/40 transition-colors">
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">{c.name}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><Badge variant="outline" className="text-xs font-medium">{c.type}</Badge></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-foreground">{pct}% <span className="text-muted-foreground text-xs">({c.nonNull.toLocaleString()})</span></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{c.nullCount.toLocaleString()}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-foreground">{Math.round((c.unique / totalRows) * 100)}%</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-foreground font-mono text-xs">{String(c.example)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

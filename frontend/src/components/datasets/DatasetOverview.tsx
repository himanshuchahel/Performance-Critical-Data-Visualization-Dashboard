


import type { Dataset } from "@/lib/demo-data";
import { formatBytes, formatRowCount, formatRelativeTime } from "@/lib/demo-data";
import { DatasetStatusBadge } from "@/components/dataset-status-badge";
import { ColumnOverview } from "./ColumnOverview";
import { DataQuality } from "./DataQuality";

interface Props { dataset?: Dataset; }

export function DatasetOverview({ dataset }: Props) {
  if (!dataset) return <div className="p-8 text-muted-foreground">Dataset not found.</div>;

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card shadow-sm p-5">
        <h2 className="text-base font-semibold text-foreground mb-3">Dataset Information</h2>
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
          {[
            { term: "Name", value: dataset.name },
            { term: "File type", value: dataset.type },
            { term: "Size", value: formatBytes(dataset.size) },
            { term: "Rows", value: formatRowCount(dataset.rows) },
            { term: "Columns", value: dataset.columns.toString() },
            { term: "Created", value: dataset.createdAt.toLocaleDateString() },
            { term: "Updated", value: formatRelativeTime(dataset.updatedAt) },
            { term: "Status", value: dataset.status, badge: true },
          ].map((item) => (
            <div key={item.term} className="rounded-lg bg-muted/40 p-3">
              <dt className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{item.term}</dt>
              <dd className="text-sm font-semibold text-foreground mt-0.5">{item.badge ? <DatasetStatusBadge status={dataset.status} /> : item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <ColumnOverview columns={dataset.columnDefs} totalRows={dataset.rows} />
      <DataQuality dataset={dataset} />
    </div>
  );
}

import {
  Upload,
  BarChart3,
  Database,
  ArrowUpRight,
} from "lucide-react";

interface QuickActionsProps {
  onUploadClick: () => void;
}

export function QuickActions({
  onUploadClick,
}: QuickActionsProps) {
  return (
    <section aria-labelledby="quick-actions-heading">
      <div className="mb-4">
        <h2
          id="quick-actions-heading"
          className="text-sm font-semibold tracking-tight text-foreground"
        >
          Quick Actions
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Quickly access common DataForge actions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

        {/* Upload Dataset */}
        <button
          type="button"
          onClick={onUploadClick}
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-border/60 hover:bg-muted/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border transition-transform group-hover:scale-105">
            <Upload className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              Upload Dataset
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground">
              Add a new dataset
            </div>
          </div>

          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </button>

        {/* Create Visualization */}
        <a
          href="/visualizations"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-border/60 hover:bg-muted/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border transition-transform group-hover:scale-105">
            <BarChart3 className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              Create Visualization
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground">
              Build a new chart
            </div>
          </div>

          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>

        {/* Browse Datasets */}
        <a
          href="/datasets"
          className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-border/60 hover:bg-muted/40 hover:shadow-md"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border transition-transform group-hover:scale-105">
            <Database className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-foreground">
              Browse Datasets
            </div>

            <div className="mt-0.5 text-xs text-muted-foreground">
              View all your datasets
            </div>
          </div>

          <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </a>

      </div>
    </section>
  );
}
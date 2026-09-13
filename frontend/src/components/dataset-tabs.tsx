import { useState } from "react";
import { BarChart3, Table, Zap, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "data", label: "Data", icon: Table },
  { id: "visualize", label: "Visualize", icon: Zap },
  { id: "performance", label: "Performance", icon: Workflow },
];

export function DatasetTabs() {
  const [active, setActive] = useState("overview");
  return (
    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5 w-fit border border-border/60" role="tablist" aria-label="Dataset tabs">
      {tabs.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
              active === t.id ? "bg-background text-foreground shadow-sm ring-1 ring-border" : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

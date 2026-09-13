import { Button } from "@/components/ui/button";
import { Plus, Play } from "lucide-react";

export function PageHeader({
  title,
  description,
  primaryAction,
  secondaryAction,
}: {
  title: string;
  description?: string;
  primaryAction?: { label: string; onClick?: () => void };
  secondaryAction?: { label: string; onClick?: () => void };
}) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{description}</p>}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 shrink-0">
            {secondaryAction && (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                <Play className="h-3.5 w-3.5" />
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button size="sm" onClick={primaryAction.onClick}>
                <Plus className="h-3.5 w-3.5" />
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

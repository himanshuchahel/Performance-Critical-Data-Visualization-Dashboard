import { Database, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DatasetEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
  onUploadClick: () => void;
}

export function DatasetEmptyState({
  hasFilters,
  onClearFilters,
  onUploadClick,
}: DatasetEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Database className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">No datasets found</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <div className="mt-6 flex gap-3">
          <Button variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
          <Button onClick={onUploadClick}>
            <Upload className="h-4 w-4 mr-2" />
            Upload Dataset
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Database className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-foreground">No datasets yet</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">
        Get started by uploading your first dataset or importing a sample.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={onUploadClick}>
          Import Sample
        </Button>
        <Button onClick={onUploadClick}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Dataset
        </Button>
      </div>
    </div>
  );
}

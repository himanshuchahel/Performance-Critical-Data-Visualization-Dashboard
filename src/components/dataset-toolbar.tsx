import { Search, X, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  FileType,
  DatasetStatus,
  SortField,
} from "@/lib/demo-data";

interface DatasetToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  fileTypeFilter: FileType | "All";
  onFileTypeChange: (type: FileType | "All") => void;
  statusFilter: DatasetStatus | "All";
  onStatusChange: (status: DatasetStatus | "All") => void;
  sortField: SortField;
  onSortChange: (field: SortField) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  totalCount: number;
  filteredCount: number;
}

export function DatasetToolbar({
  searchQuery,
  onSearchChange,
  fileTypeFilter,
  onFileTypeChange,
  statusFilter,
  onStatusChange,
  sortField,
  onSortChange,
  hasActiveFilters,
  onClearFilters,
  totalCount,
  filteredCount,
}: DatasetToolbarProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search datasets..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9 w-full rounded-lg border border-border bg-background pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-5 w-5 rounded-md hover:bg-muted flex items-center justify-center transition-colors"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* File Type Filter */}
        <Select value={fileTypeFilter} onValueChange={(v) => onFileTypeChange(v as FileType | "All")}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types</SelectItem>
            <SelectItem value="CSV">CSV</SelectItem>
            <SelectItem value="JSON">JSON</SelectItem>
            <SelectItem value="Parquet">Parquet</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={(v) => onStatusChange(v as DatasetStatus | "All")}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All status</SelectItem>
            <SelectItem value="Ready">Ready</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortField} onValueChange={(v) => onSortChange(v as SortField)}>
          <SelectTrigger className="w-full sm:w-[140px] h-9">
            <ArrowUpDown className="h-3.5 w-3.5 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="rows">Rows</SelectItem>
            <SelectItem value="size">Size</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active filters indicator */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Showing {filteredCount} of {totalCount} datasets
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={onClearFilters}
            className="h-6 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}

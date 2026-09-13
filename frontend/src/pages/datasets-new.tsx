import { useState, useEffect, useMemo } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { TopHeader } from "@/components/top-header";
import { PageHeader } from "@/components/page-header";
import { DatasetToolbar } from "@/components/dataset-toolbar";
import { DatasetTable } from "@/components/datasets-table";
import { DatasetUploadDialog } from "@/components/dataset-upload-dialog";
import { DatasetEmptyState } from "@/components/dataset-empty-state";
import { DatasetTableSkeleton } from "@/components/dataset-table-skeleton";
import { listDatasets, deleteDataset } from "@/api/datasets";
import { RenameDialog } from "@/components/rename-dialog";
import { DuplicateDialog } from "@/components/duplicate-dialog";
import { DownloadDialog } from "@/components/download-dialog";
import type { Dataset as ApiDataset } from "@/types";
import { filterDatasets, sortDatasets } from "@/lib/demo-data";
import type {
  FileType,
  DatasetStatus,
  SortField,
} from "@/lib/demo-data";

export default function DatasetsPage() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const normalizeDataset = (dataset: ApiDataset): any => ({
  id: dataset._id,
  name: dataset.name,
  type: dataset.fileType,
  rows: dataset.rowCount,
  columns: dataset.columnCount,
  size: dataset.fileSize,
  status: dataset.status,
  createdAt: new Date(dataset.createdAt),
  updatedAt: new Date(dataset.updatedAt),
  });

  // State for filtering and sorting
  const [datasets, setDatasets] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState<FileType | "All">("All");
  const [statusFilter, setStatusFilter] = useState<DatasetStatus | "All">("All");
  const [sortField, setSortField] = useState<SortField>("updated");
  const [sortDirection] = useState<"desc">("desc");

  const [error, setError] = useState("");
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState<{ id: string; name: string } | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateId, setDuplicateId] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [downloadTarget, setDownloadTarget] = useState<{ id: string; name?: string } | null>(null);

  // Load real datasets
  useEffect(() => {
    setIsLoading(true);
    setError("");
    listDatasets()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDatasets(res.data.map(normalizeDataset));
        } else {
          setDatasets([]);
        }
      })
      .catch((err: any) => {
        setError(err?.message || "Failed to load datasets.");
        setDatasets([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Filter and sort datasets
  const filteredAndSortedDatasets = useMemo(() => {
    const filtered = filterDatasets(datasets, searchQuery, fileTypeFilter, statusFilter);
    return sortDatasets(filtered, sortField, sortDirection);
  }, [datasets, searchQuery, fileTypeFilter, statusFilter, sortField, sortDirection]);

  const hasActiveFilters = searchQuery !== "" || fileTypeFilter !== "All" || statusFilter !== "All";

  const handleClearFilters = () => {
    setSearchQuery("");
    setFileTypeFilter("All");
    setStatusFilter("All");
  };

  const handleRenameOpen = (id: string, name: string) => { setRenameTarget({ id, name }); setRenameOpen(true); };
  // const handleRenameConfirm = async (id: string, newName: string) => {
  //   try {
  //     await updateDataset(id, { name: newName.trim() });
  //     setDatasets((prev) => prev.map((ds: any) => (ds._id || ds.id) === id ? { ...ds, name: newName.trim() } : ds));
  //   } catch (err: any) { setError(err?.message || "Failed to rename"); }
  // };
  const handleDuplicateOpen = (id: string) => { setDuplicateId(id); setDuplicateOpen(true); };

  // Rename/duplicate handlers kept for future use


  const handleDelete = async (id: string) => {
    try {
      await deleteDataset(id);
      setDatasets((prev) => prev.filter((ds: any) => (ds._id || ds.id) !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete dataset.");
    }
  };


  const handleUploadClick = () => {
    setUploadDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
        currentPath="/datasets"
      />

      <div className={"transition-all duration-300 md:ml-16" + (collapsed ? "" : " md:ml-[14.5rem]")}>
        <TopHeader title="Datasets" breadcrumb="Data / Datasets" onMenuClick={() => setMobileOpen(true)} />

        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-8 max-w-7xl mx-auto">
          <PageHeader
            title="Datasets"
            description="Upload, manage, and explore your datasets."
            primaryAction={{
              label: "Upload Dataset",
              onClick: handleUploadClick,
            }}
            secondaryAction={{
              label: "Import Sample",
              onClick: handleUploadClick,
            }}
          />

          <div className="space-y-6">
            {/* Toolbar */}
            {!isLoading && datasets.length > 0 && (
              <DatasetToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                fileTypeFilter={fileTypeFilter}
                onFileTypeChange={setFileTypeFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                sortField={sortField}
                onSortChange={setSortField}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
                totalCount={datasets.length}
                filteredCount={filteredAndSortedDatasets.length}
              />
            )}

            {/* Loading state */}
            {isLoading && <DatasetTableSkeleton />}

            {/* Empty state */}
            {error && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm px-3 py-2 border border-destructive/20 mb-4">{error}</div>
            )}

            {!isLoading && datasets.length === 0 && (
              <DatasetEmptyState
                hasFilters={false}
                onClearFilters={handleClearFilters}
                onUploadClick={handleUploadClick}
              />
            )}

            {/* No results from filters */}
            {!isLoading && datasets.length > 0 && filteredAndSortedDatasets.length === 0 && (
              <DatasetEmptyState
                hasFilters={true}
                onClearFilters={handleClearFilters}
                onUploadClick={handleUploadClick}
              />
            )}

            {/* Dataset table */}
            {!isLoading && filteredAndSortedDatasets.length > 0 && (
              <DatasetTable datasets={filteredAndSortedDatasets} onDelete={handleDelete} onRename={handleRenameOpen} onDuplicate={handleDuplicateOpen} onDownload={(id, name) => { setDownloadTarget({ id, name }); setDownloadOpen(true); }} />
            )}
          </div>
        </main>
      </div>

      {/* Rename dialog */}
      {renameTarget && (
        <RenameDialog
          open={renameOpen}
          onOpenChange={setRenameOpen}
          datasetId={renameTarget.id}
          currentName={renameTarget.name}
          onRenamed={() => {
            listDatasets().then((res) => {
              if (res.success && Array.isArray(res.data)) {
                setDatasets(res.data.map(normalizeDataset));
              }
            });
          }}
        />
      )}

      {/* Duplicate dialog */}
      {duplicateId && <DuplicateDialog open={duplicateOpen} onOpenChange={setDuplicateOpen} datasetId={duplicateId} onDuplicated={() => {
        listDatasets().then((r) => {
          if (r.success && Array.isArray(r.data)) {
            setDatasets(r.data.map(normalizeDataset));
          }
        });
      }} 
      />}

      {/* Download dialog */}
      {downloadTarget && <DownloadDialog open={downloadOpen} onOpenChange={setDownloadOpen} datasetId={downloadTarget.id} fileName={downloadTarget.name} />}

      {/* Upload dialog */}
      <DatasetUploadDialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onUploaded={() => {
        setIsLoading(true);
        listDatasets().then((res) => {
          if (res.success && Array.isArray(res.data)) {
            setDatasets(res.data.map(normalizeDataset));
          }
        }).catch(() => {}).finally(() => setIsLoading(false));
      }} />
    </div>
  );
}

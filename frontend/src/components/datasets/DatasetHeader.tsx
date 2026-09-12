import {
  ChevronLeft,
  FileText,
  MoreHorizontal,
  Download,
  Trash2,
  Pencil,
  Copy,
  Loader2,
} from "lucide-react";

import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DatasetStatusBadge } from "@/components/dataset-status-badge";

import {
  updateDataset,
  duplicateDataset,
  deleteDataset,
  downloadDataset,
} from "@/api/datasets";

import type { Dataset } from "@/lib/demo-data";
import {
  formatBytes,
  formatRowCount,
} from "@/lib/demo-data";

interface Props {
  dataset?: Dataset;

  /**
   * Optional callback for the parent.
   * If provided, it will be called after rename,
   * duplicate or delete.
   */
  onDatasetChanged?: () => void;
}

export function DatasetHeader({
  dataset,
  onDatasetChanged,
}: Props) {
  // ============================================
  // RENAME STATE
  // ============================================

  const [renameOpen, setRenameOpen] =
    useState(false);

  const [newName, setNewName] =
    useState("");

  const [renameLoading, setRenameLoading] =
    useState(false);

  const [renameError, setRenameError] =
    useState("");

  // ============================================
  // DOWNLOAD STATE
  // ============================================

  const [downloadLoading, setDownloadLoading] =
    useState(false);

  // ============================================
  // DUPLICATE STATE
  // ============================================

  const [duplicateLoading, setDuplicateLoading] =
    useState(false);

  // ============================================
  // DELETE STATE
  // ============================================

  const [deleteOpen, setDeleteOpen] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState("");

  // ============================================
  // DATASET NOT FOUND
  // ============================================

  if (!dataset) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="text-muted-foreground">
          Dataset not found.
        </div>

        <Link
          to="/datasets"
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Datasets
        </Link>
      </div>
    );
  }

  // ============================================
  // DATASET ID
  // ============================================

  const datasetId =
    (dataset as Dataset & {
      _id?: string;
    }).id ||
    (dataset as Dataset & {
      _id?: string;
    })._id ||
    "";

  // ============================================
  // OPEN RENAME
  // ============================================

  const handleOpenRename = () => {
    setNewName(dataset.name);
    setRenameError("");
    setRenameOpen(true);
  };

  // ============================================
  // RENAME
  // ============================================

  const handleRename = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const trimmedName =
      newName.trim();

    if (!trimmedName) {
      setRenameError(
        "Dataset name cannot be empty."
      );
      return;
    }

    if (!datasetId) {
      setRenameError(
        "Dataset ID is missing."
      );
      return;
    }

    if (
      trimmedName ===
      dataset.name
    ) {
      setRenameOpen(false);
      return;
    }

    try {
      setRenameLoading(true);
      setRenameError("");

      const response =
        await updateDataset(
          datasetId,
          {
            name: trimmedName,
          }
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to rename dataset."
        );
      }

      setRenameOpen(false);

      if (onDatasetChanged) {
        onDatasetChanged();
      } else {
        window.location.reload();
      }
    } catch (error) {
      setRenameError(
        error instanceof Error
          ? error.message
          : "Failed to rename dataset."
      );
    } finally {
      setRenameLoading(false);
    }
  };

  // ============================================
  // DOWNLOAD
  // ============================================

  const handleDownload = async () => {
    if (!datasetId) {
      return;
    }

    try {
      setDownloadLoading(true);

      const blob =
        await downloadDataset(
          datasetId
        );

      const url =
        URL.createObjectURL(blob);

      const anchor =
        document.createElement("a");

      anchor.href = url;

      const extension =
        dataset.type
          ?.toLowerCase() || "csv";

      anchor.download =
        `${dataset.name}.${extension}`;

      document.body.appendChild(
        anchor
      );

      anchor.click();

      document.body.removeChild(
        anchor
      );

      URL.revokeObjectURL(url);
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to download dataset."
      );
    } finally {
      setDownloadLoading(false);
    }
  };

  // ============================================
  // DUPLICATE
  // ============================================

  const handleDuplicate = async () => {
    if (!datasetId) {
      return;
    }

    try {
      setDuplicateLoading(true);

      const response =
        await duplicateDataset(
          datasetId
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to duplicate dataset."
        );
      }

      if (onDatasetChanged) {
        onDatasetChanged();
      } else {
        window.location.reload();
      }
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Failed to duplicate dataset."
      );
    } finally {
      setDuplicateLoading(false);
    }
  };

  // ============================================
  // DELETE
  // ============================================

  const handleDelete = async () => {
    if (!datasetId) {
      return;
    }

    try {
      setDeleteLoading(true);
      setDeleteError("");

      const response =
        await deleteDataset(
          datasetId
        );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to delete dataset."
        );
      }

      setDeleteOpen(false);

      /*
       * Dataset has been deleted.
       * Go back to datasets page.
       */
      window.location.href =
        "/datasets";
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Failed to delete dataset."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // ============================================
  // UI
  // ============================================

  return (
    <>
      {/* ========================================
          DATASET HEADER
      ======================================== */}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">

        <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">

          {/* ======================================
              DATASET INFO
          ====================================== */}

          <div className="min-w-0 flex-1">

            {/* Breadcrumb */}

            <div className="mb-2 flex items-center gap-2">

              <Link
                to="/datasets"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Back to datasets"
              >
                <ChevronLeft className="h-3.5 w-3.5" />

                Datasets
              </Link>

              <span className="text-muted-foreground">
                /
              </span>

              <span className="truncate text-xs font-medium text-foreground">
                {dataset.name}
              </span>

            </div>

            {/* Dataset Name */}

            <h1 className="truncate text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              {dataset.name}
            </h1>

            {/* Dataset Metadata */}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">

              <span className="inline-flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" />

                {dataset.type}
              </span>

              <span>·</span>

              <span>
                {formatBytes(
                  dataset.size
                )}
              </span>

              <span>·</span>

              <span>
                {formatRowCount(
                  dataset.rows
                )}{" "}
                rows
              </span>

              <span>·</span>

              <span>
                {dataset.columns} cols
              </span>

            </div>

            {/* Status */}

            <div className="mt-3 flex items-center gap-2">
              <DatasetStatusBadge
                status={
                  dataset.status
                }
              />
            </div>

          </div>

          {/* ======================================
              ACTIONS
          ====================================== */}

          <div className="flex shrink-0 items-center gap-2">

            {/* DOWNLOAD */}

            <Button
              size="sm"
              variant="outline"
              onClick={
                handleDownload
              }
              disabled={
                downloadLoading ||
                !datasetId
              }
            >
              {downloadLoading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="mr-1.5 h-3.5 w-3.5" />
              )}

              {downloadLoading
                ? "Downloading..."
                : "Download"}
            </Button>

            {/* MORE ACTIONS */}

            <DropdownMenu>

              <DropdownMenuTrigger
              >
                <Button
                  size="sm"
                  variant="outline"
                  aria-label="More actions"
                  disabled={
                    duplicateLoading
                  }
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-44"
              >

                {/* RENAME */}

                <DropdownMenuItem
                  onClick={
                    handleOpenRename
                  }
                >
                  <Pencil className="mr-2 h-3.5 w-3.5" />

                  Rename
                </DropdownMenuItem>

                {/* DUPLICATE */}

                <DropdownMenuItem
                  onClick={
                    handleDuplicate
                  }
                  disabled={
                    duplicateLoading
                  }
                >
                  {duplicateLoading ? (
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Copy className="mr-2 h-3.5 w-3.5" />
                  )}

                  {duplicateLoading
                    ? "Duplicating..."
                    : "Duplicate"}
                </DropdownMenuItem>

                {/* DELETE */}

                <DropdownMenuItem
                  onClick={() => {
                    setDeleteError("");
                    setDeleteOpen(true);
                  }}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />

                  Delete
                </DropdownMenuItem>

              </DropdownMenuContent>

            </DropdownMenu>

          </div>

        </div>

      </div>

      {/* ==========================================
          RENAME MODAL
      ========================================== */}

      {renameOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!renameLoading) {
                setRenameOpen(false);
              }
            }
          }}
        >

          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">

            {/* Header */}

            <div className="mb-5">

              <h2 className="text-lg font-semibold text-foreground">
                Rename Dataset
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Enter a new name for this
                dataset.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                handleRename
              }
              className="space-y-4"
            >

              <div className="space-y-2">

                <label
                  htmlFor="dataset-name"
                  className="text-sm font-medium text-foreground"
                >
                  Dataset name
                </label>

                <input
                  id="dataset-name"
                  type="text"
                  value={newName}
                  onChange={(event) =>
                    setNewName(
                      event.target.value
                    )
                  }
                  autoFocus
                  disabled={
                    renameLoading
                  }
                  placeholder="Enter dataset name"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary"
                />

              </div>

              {/* ERROR */}

              {renameError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {renameError}
                </div>
              )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-2">

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setRenameOpen(
                      false
                    )
                  }
                  disabled={
                    renameLoading
                  }
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={
                    renameLoading ||
                    !newName.trim()
                  }
                >
                  {renameLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}

                  {renameLoading
                    ? "Saving..."
                    : "Save Changes"}
                </Button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ==========================================
          DELETE CONFIRMATION MODAL
      ========================================== */}

      {deleteOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!deleteLoading) {
                setDeleteOpen(false);
              }
            }
          }}
        >

          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">

            {/* Icon */}

            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            {/* Header */}

            <h2 className="text-lg font-semibold text-foreground">
              Delete Dataset?
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                "{dataset.name}"
              </span>
              ?
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              This action will remove the
              dataset and its stored file.
              This cannot be undone.
            </p>

            {/* ERROR */}

            {deleteError && (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {deleteError}
              </div>
            )}

            {/* BUTTONS */}

            <div className="mt-6 flex justify-end gap-2">

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteOpen(
                    false
                  )
                }
                disabled={
                  deleteLoading
                }
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={
                  handleDelete
                }
                disabled={
                  deleteLoading
                }
              >
                {deleteLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}

                {deleteLoading
                  ? "Deleting..."
                  : "Delete Dataset"}
              </Button>

            </div>

          </div>

        </div>
      )}
    </>
  );
}
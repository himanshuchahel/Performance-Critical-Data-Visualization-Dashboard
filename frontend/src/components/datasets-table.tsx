import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, FileJson, FileType, MoreHorizontal, Trash2, Copy, Edit2, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DatasetStatusBadge } from "@/components/dataset-status-badge";
import type { Dataset } from "@/lib/demo-data";
import { formatBytes, formatRowCount, formatRelativeTime } from "@/lib/demo-data";
import { cn as _cn } from "@/lib/utils";

interface DatasetTableProps {
  datasets: Dataset[];
  onDelete: (id: string) => void;
  onRename?: (id: string, name: string) => void;
  onDuplicate?: (id: string) => void;
  onDownload?: (id: string, name?: string) => void;
}

export function DatasetTable({ datasets, onDelete, onRename, onDuplicate, onDownload }: DatasetTableProps) {
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [datasetToDelete, setDatasetToDelete] = useState<Dataset | null>(null);

  const handleOpen = (id: string) => {
    navigate(`/datasets/${id}`);
  };

  const handleDeleteClick = (dataset: Dataset) => {
    setDatasetToDelete(dataset);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (datasetToDelete) {
      onDelete(datasetToDelete.id);
      setDeleteDialogOpen(false);
      setDatasetToDelete(null);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "JSON":
        return FileJson;
      case "CSV":
        return FileSpreadsheet;
      case "Parquet":
        return FileType;
      default:
        return FileSpreadsheet;
    }
  };

  if (datasets.length === 0) {
    return null;
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="font-semibold">Dataset</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">Rows</TableHead>
                <TableHead className="font-semibold text-right">Columns</TableHead>
                <TableHead className="font-semibold text-right">Size</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Updated</TableHead>
                <TableHead className="font-semibold w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {datasets.map((dataset) => {
                const FileIcon = getFileIcon(dataset.type);
                return (
                  <TableRow
                    key={dataset.id}
                    className="group cursor-pointer hover:bg-muted/40"
                    onClick={() => handleOpen(dataset.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground ring-1 ring-border">
                          <FileIcon className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-foreground truncate max-w-[200px]">
                          {dataset.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {dataset.type}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono text-right">
                      {formatRowCount(dataset.rows)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm font-mono text-right">
                      {dataset.columns}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm text-right">
                      {formatBytes(dataset.size)}
                    </TableCell>
                    <TableCell>
                      <DatasetStatusBadge status={dataset.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatRelativeTime(dataset.updatedAt)}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem onClick={() => handleOpen(dataset.id)}>
                            Open
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRename && onRename(dataset.id, dataset.name)}>
                            <Edit2 className="h-3.5 w-3.5 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDuplicate && onDuplicate(dataset.id)}>
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDownload && onDownload(dataset.id, dataset.name)}>
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClick(dataset)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete dataset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{datasetToDelete?.name}</strong>? This
              action cannot be undone and will permanently remove the dataset and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete dataset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { downloadDataset } from "@/api/datasets";

interface DownloadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  fileName?: string;
}

export function DownloadDialog({ open, onOpenChange, datasetId, fileName }: DownloadDialogProps) {
  const [downloading, setDownloading] = useState(false);

  const handleConfirm = async () => {
    setDownloading(true);
    try {
      const blob = await downloadDataset(datasetId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "dataset";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to download dataset");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Download dataset?</DialogTitle>
          <DialogDescription>Download the original dataset file?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={downloading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={downloading}>{downloading ? "Downloading..." : "Download"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

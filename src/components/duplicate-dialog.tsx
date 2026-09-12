import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { duplicateDataset } from "@/api/datasets";

interface DuplicateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  onDuplicated?: () => void;
}

export function DuplicateDialog({ open, onOpenChange, datasetId, onDuplicated }: DuplicateDialogProps) {
  const [duplicating, setDuplicating] = useState(false);

  const handleConfirm = async () => {
    setDuplicating(true);
    try {
      await duplicateDataset(datasetId);
      toast.success("Dataset duplicated successfully");
      onOpenChange(false);
      if (onDuplicated) onDuplicated();
    } catch (err: any) {
      toast.error(err?.message || "Failed to duplicate dataset");
    } finally {
      setDuplicating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duplicate dataset?</DialogTitle>
          <DialogDescription>Create a copy of this dataset?</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={duplicating}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={duplicating}>{duplicating ? "Duplicating..." : "Duplicate"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

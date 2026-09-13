import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDataset } from "@/api/datasets";

interface RenameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  currentName: string;
  onRenamed?: () => void;
}

export function RenameDialog({ open, onOpenChange, datasetId, currentName, onRenamed }: RenameDialogProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Dataset name cannot be empty");
      return;
    }
    setSaving(true);
    try {
      await updateDataset(datasetId, { name: trimmed });
      toast.success("Rename confirmed");
      onOpenChange(false);
      if (onRenamed) onRenamed();
    } catch (err: any) {
      toast.error(err?.message || "Failed to rename dataset");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rename dataset</DialogTitle>
          <DialogDescription>Enter a new name for this dataset.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="rename-name" className="text-sm font-medium">Dataset name</label>
            <Input
              id="rename-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
              onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving || !name.trim()}>
            {saving ? "Renaming..." : "Rename"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

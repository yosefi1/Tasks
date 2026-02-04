"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteSource } from "@/lib/hooks/use-sources";
import type { Source } from "@prisma/client";

type DeleteSourceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: Source | null;
};

export function DeleteSourceDialog({ open, onOpenChange, source }: DeleteSourceDialogProps) {
  const { toast } = useToast();
  const deleteSource = useDeleteSource();

  async function handleConfirm() {
    if (!source) return;
    await deleteSource.mutateAsync(source.id);
    toast({ title: "Source deleted", description: "The source has been removed." });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete source</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Are you sure you want to delete &quot;{source?.title}&quot;? This cannot be undone.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteSource.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={deleteSource.isPending}>
            {deleteSource.isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

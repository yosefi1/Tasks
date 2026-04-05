"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ColorPresetRow } from "@/components/color-preset-row";
import { useToast } from "@/components/ui/use-toast";
import { useTaskCategoryStyles, useUpdateTaskCategoryStyle } from "@/lib/hooks/use-task-category-styles";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type TaskCategoryColorsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TaskCategoryColorsDialog({ open, onOpenChange }: TaskCategoryColorsDialogProps) {
  const { toast } = useToast();
  const { data: rows = [], isLoading } = useTaskCategoryStyles();
  const updateStyle = useUpdateTaskCategoryStyle();
  const [personal, setPersonal] = useState("#8b5cf6");
  const [work, setWork] = useState("#0ea5e9");

  useEffect(() => {
    if (!open || !rows.length) return;
    const p = rows.find((r) => r.slug === "personal");
    const w = rows.find((r) => r.slug === "work");
    if (p?.color) setPersonal(p.color);
    if (w?.color) setWork(w.color);
  }, [open, rows]);

  async function save() {
    try {
      await updateStyle.mutateAsync({ slug: "personal", color: personal });
      await updateStyle.mutateAsync({ slug: "work", color: work });
      toast({ title: "Colors saved", variant: "success" });
      onOpenChange(false);
    } catch (e) {
      toast({
        title: "Could not save",
        description: e instanceof Error ? e.message : "Invalid color",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Task tab colors</DialogTitle>
          <DialogDescription>
            Default stripe color for cards in the Private and Work tabs (unless a task has its own color).
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Private</Label>
              <ColorPresetRow value={personal} onChange={setPersonal} />
            </div>
            <div className="space-y-2">
              <Label>Work</Label>
              <ColorPresetRow value={work} onChange={setWork} />
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={updateStyle.isPending || isLoading}>
            {updateStyle.isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

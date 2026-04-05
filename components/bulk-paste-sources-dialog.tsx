"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useBulkCreateSources } from "@/lib/hooks/use-sources";
import type { SourceCategory } from "@prisma/client";

type BulkPasteSourcesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: SourceCategory[];
  defaultCategoryId: string;
};

export function BulkPasteSourcesDialog({
  open,
  onOpenChange,
  categories,
  defaultCategoryId,
}: BulkPasteSourcesDialogProps) {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSources();
  const [pastedText, setPastedText] = useState("");
  const [type, setType] = useState<"site" | "video">("site");
  const [categoryId, setCategoryId] = useState(defaultCategoryId);

  useEffect(() => {
    if (open) {
      const first = categories[0]?.id;
      setCategoryId((prev) => {
        if (prev && categories.some((c) => c.id === prev)) return prev;
        return defaultCategoryId || first || "";
      });
    }
  }, [open, categories, defaultCategoryId]);

  async function handleSubmit() {
    if (!categoryId) {
      toast({
        title: "Choose a category",
        description: "Add categories in settings if none are listed.",
        variant: "destructive",
      });
      return;
    }
    if (!pastedText.trim()) {
      toast({ title: "Paste some content", description: "Add URLs or lines with Title | URL.", variant: "destructive" });
      return;
    }
    const result = await bulkCreate.mutateAsync({ categoryId, pastedText, type });
    toast({
      title: "Sources added",
      description: `${result.created} source(s) added.`,
      variant: "success",
    });
    setPastedText("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Paste from document</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Paste one link per line, or use <code className="rounded bg-muted px-1">Title | URL</code> per line.
        </p>
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            placeholder={"React docs | https://react.dev\nhttps://youtube.com/watch?v=..."}
            rows={8}
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            className="font-mono text-sm"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as "site" | "video")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              value={categoryId}
              onValueChange={setCategoryId}
              disabled={!categories.length}
            >
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={bulkCreate.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bulkCreate.isPending || !pastedText.trim() || !categoryId}>
            {bulkCreate.isPending ? "Adding…" : "Add all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

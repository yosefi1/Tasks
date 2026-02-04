"use client";

import { useState } from "react";
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

type BulkPasteSourcesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: "private" | "work";
};

export function BulkPasteSourcesDialog({
  open,
  onOpenChange,
  category,
}: BulkPasteSourcesDialogProps) {
  const { toast } = useToast();
  const bulkCreate = useBulkCreateSources();
  const [pastedText, setPastedText] = useState("");
  const [type, setType] = useState<"site" | "video">("site");

  async function handleSubmit() {
    if (!pastedText.trim()) {
      toast({ title: "Paste some content", description: "Add URLs or lines with Title | URL.", variant: "destructive" });
      return;
    }
    const result = await bulkCreate.mutateAsync({ category, pastedText, type });
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
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={bulkCreate.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={bulkCreate.isPending || !pastedText.trim()}>
            {bulkCreate.isPending ? "Adding…" : "Add all"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

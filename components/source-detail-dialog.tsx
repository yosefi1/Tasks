"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink } from "lucide-react";
import type { SourceWithCategory } from "@/lib/types";

type SourceDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: SourceWithCategory | null;
  onDelete: (source: SourceWithCategory) => void;
};

export function SourceDetailDialog({
  open,
  onOpenChange,
  source,
  onDelete,
}: SourceDetailDialogProps) {
  if (!source) return null;

  const topic = (source as { topic?: string | null }).topic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="pr-8">{source.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {source.type}
            </Badge>
            <Badge variant="outline">
              {source.category.name}
            </Badge>
            {topic && (
              <Badge variant="outline">{topic}</Badge>
            )}
          </div>
          <div>
            <p className="text-muted-foreground text-xs font-medium">URL</p>
            <a
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 break-all text-primary hover:underline"
            >
              {source.url}
              <ExternalLink className="h-4 w-4 shrink-0" />
            </a>
          </div>
          {source.notes && (
            <div>
              <p className="text-muted-foreground text-xs font-medium">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{source.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={() => {
              onOpenChange(false);
              onDelete(source);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

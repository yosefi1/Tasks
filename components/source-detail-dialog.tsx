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
import { Trash2, ExternalLink, Pencil } from "lucide-react";
import type { SourceWithCategory } from "@/lib/types";
import { getVideoEmbedInfo } from "@/lib/video-embed";
import { VideoEmbedPreview } from "@/components/video-embed-preview";
import { cn } from "@/lib/utils";

type SourceDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: SourceWithCategory | null;
  onEdit: (source: SourceWithCategory) => void;
  onDelete: (source: SourceWithCategory) => void;
};

export function SourceDetailDialog({
  open,
  onOpenChange,
  source,
  onEdit,
  onDelete,
}: SourceDetailDialogProps) {
  if (!source) return null;

  const topic = (source as { topic?: string | null }).topic;
  const embedInfo = getVideoEmbedInfo(source.url);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-y-auto",
          embedInfo ? "sm:max-w-2xl" : "sm:max-w-lg"
        )}
      >
        <DialogHeader>
          <DialogTitle className="pr-8">{source.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">
              {source.type}
            </Badge>
            <Badge
              variant="outline"
              style={
                source.category.color && /^#[0-9A-Fa-f]{6}$/.test(source.category.color)
                  ? { borderColor: source.category.color, color: source.category.color }
                  : undefined
              }
            >
              {source.category.name}
            </Badge>
            {topic && (
              <Badge variant="outline">{topic}</Badge>
            )}
          </div>
          <VideoEmbedPreview url={source.url} embedInfo={embedInfo} />
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
          {source.relatedUrl && (
            <div>
              <p className="text-muted-foreground text-xs font-medium">Related link</p>
              <a
                href={source.relatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 break-all text-primary hover:underline"
              >
                {source.relatedUrl}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>
          )}
          {source.notes && (
            <div>
              <p className="text-muted-foreground text-xs font-medium">Notes</p>
              <p className="text-sm whitespace-pre-wrap">{source.notes}</p>
            </div>
          )}
        </div>
        <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onEdit(source)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
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

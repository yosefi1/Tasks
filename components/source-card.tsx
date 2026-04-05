"use client";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, Video } from "lucide-react";
import type { SourceWithCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type SourceCardProps = {
  source: SourceWithCategory;
  onEdit: (source: SourceWithCategory) => void;
  onDelete: (source: SourceWithCategory) => void;
};

export function SourceCard({ source, onEdit, onDelete }: SourceCardProps) {
  const isVideo = source.type === "video";
  const categoryLabel = source.category.name;

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="font-semibold leading-tight line-clamp-2">
            {source.title}
          </h3>
          <div className="flex shrink-0 gap-1">
            <Badge variant="outline" className="capitalize">
              {categoryLabel}
            </Badge>
            <Badge variant={isVideo ? "secondary" : "default"}>
              {isVideo ? (
                <Video className="mr-1 h-3 w-3" />
              ) : (
                <ExternalLink className="mr-1 h-3 w-3" />
              )}
              {source.type}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-2">
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline line-clamp-1 break-all"
        >
          {source.url}
        </a>
        {source.notes && (
          <p className="mt-2 text-muted-foreground text-sm line-clamp-2">
            {source.notes}
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(source)}
          aria-label="Edit source"
        >
          <Pencil className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Edit</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(source)}
          aria-label="Delete source"
        >
          <Trash2 className="h-4 w-4 sm:mr-1" />
          <span className="hidden sm:inline">Delete</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
